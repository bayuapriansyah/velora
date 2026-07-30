// Velora Autonomous Agent
// ------------------------------------------------------------------
// This script is the "AI Agent" the Velora SDD talks about — a process
// that holds its OWN wallet (funded with only enough BOT for gas) and
// decides, on its own schedule, whether to ask the Velora smart contract
// to execute a transaction against a policy. It never touches the user's
// wallet, never bypasses validation, and every decision it makes is still
// re-checked and enforced by the contract — the agent can only REQUEST,
// the contract ALONE approves or rejects.
//
// Usage:
//   npm install
//   cp .env.example .env      # fill in the real values
//   npm start                 # runs forever, acting every INTERVAL_MINUTES
//   npm run once               # runs a single decision cycle then exits
import "dotenv/config";
import { ethers } from "ethers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ABI = JSON.parse(readFileSync(join(__dirname, "abi.json"), "utf-8"));

const {
  RPC_URL,
  CONTRACT_ADDRESS,
  AGENT_PRIVATE_KEY,
  GEMINI_API_KEY,
  REQUEST_AMOUNT_BOT,
  INTERVAL_MINUTES,
} = process.env;

const ACTION_LABELS = ["Transfer", "Swap", "ContractCall"];
const REJECT_REASON_LABELS = [
  "Expired",
  "DestinationMismatch",
  "ActionMismatch",
  "InsufficientBudget",
  "ExecutionLimitReached",
  "NotActive",
  "InvalidExecutionAmount",
  "PaymentNotDue",
];

function requireEnv(name, value) {
  if (
    !value ||
    value.startsWith("0xYour") ||
    value === "your_gemini_api_key_here"
  ) {
    console.error(
      `\n[config error] Missing or placeholder value for ${name} in .env — fill it in first.\n`,
    );
    process.exit(1);
  }
  return value;
}

requireEnv("RPC_URL", RPC_URL);
requireEnv("CONTRACT_ADDRESS", CONTRACT_ADDRESS);
requireEnv("AGENT_PRIVATE_KEY", AGENT_PRIVATE_KEY);
requireEnv("GEMINI_API_KEY", GEMINI_API_KEY);

const suggestedAmountBot = REQUEST_AMOUNT_BOT ?? "0.01";
const intervalMs = Number(INTERVAL_MINUTES ?? "2") * 60 * 1000;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function getPolicySnapshot(policyId) {
  const p = await contract.getPolicy(policyId);
  return {
    id: p.id.toString(),
    name: p.name,
    remainingBudgetBot: ethers.formatEther(p.remainingBudget),
    totalBudgetBot: ethers.formatEther(p.totalBudget),
    allowedDestination: p.allowedDestination,
    allowedAction: ACTION_LABELS[Number(p.allowedAction)],
    expiration: new Date(Number(p.expiration) * 1000).toISOString(),
    maxExecutions: p.maxExecutions.toString(),
    executionCount: p.executionCount.toString(),
    status: ["Active", "Cancelled", "Expired", "Exhausted"][Number(p.status)],
    amountPerExecutionBot: ethers.formatEther(p.amountPerExecution),
    paymentIntervalSeconds: p.paymentInterval.toString(),
    lastExecutionTime: p.lastExecutionTime.toString(),
    rawPolicy: p
  };
}

/**
 * Asks Gemini whether the agent should request an execution right now, given
 * the current policy state. This is deliberately a SUGGESTION only — the
 * smart contract is still the sole authority that approves or rejects the
 * actual on-chain request afterward. A "yes" from Gemini never bypasses
 * validation; it only decides whether to try.
 */
async function askGemini(snapshot) {
  const prompt = `You are an autonomous spending agent operating under a strict on-chain policy.
You may only ever suggest requesting a transaction; a smart contract is the sole authority
that approves or rejects it based on rules you cannot change.

Current policy state:
${JSON.stringify(snapshot, null, 2)}

Suggested request amount if you decide to act: ${suggestedAmountBot} BOT

Decide whether the agent should attempt an execution request right now. Consider:
- Is the policy still Active?
- Is there enough remaining budget for the suggested amount?
- Have executions already reached the maximum?
- Is the current time past (lastExecutionTime + paymentIntervalSeconds)? Current time in seconds is ${Math.floor(Date.now() / 1000)}. (If lastExecutionTime is 0, it means it has never executed, so it's ready now).
- Is the suggested request amount exactly equal to amountPerExecutionBot?

Respond with ONLY a JSON object, no markdown, no explanation outside the JSON:
{"shouldRequest": true|false, "amountBot": "<number as string, must be exactly amountPerExecutionBot>", "reasoning": "<one short sentence>"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonText = text.replace(/^```json\s*|\s*```$/g, "");
  try {
    return JSON.parse(jsonText);
  } catch {
    log(
      "[gemini] Could not parse response, defaulting to no action. Raw response:",
      text,
    );
    return {
      shouldRequest: false,
      amountBot: "0",
      reasoning: "Failed to parse model response.",
    };
  }
}

async function actOnce() {
  log("Checking all policies on-chain...");
  let policyId = 0n;
  
  while (true) {
    let snapshot;
    try {
      snapshot = await getPolicySnapshot(policyId);
    } catch (err) {
      // Hit the end of policies
      break;
    }

    if (snapshot.status !== "Active") {
      policyId++;
      continue;
    }

    log(`Analyzing Policy #${policyId} (${snapshot.name})...`);

    const decision = await askGemini(snapshot);
    log(`Gemini decision for Policy #${policyId}:`, decision);

    if (!decision.shouldRequest) {
      log(
        `Policy #${policyId} - Gemini decided not to request this cycle. Reason:`,
        decision.reasoning,
      );
      policyId++;
      continue;
    }

    const amountWei = ethers.parseEther(
      String(decision.amountBot || suggestedAmountBot),
    );
    
    // Calculate fee (Opsi B: Fee as additional cost)
    // Fetch safetyNetFeeBps and minFeeThreshold from contract to be precise
    const feeBps = await contract.safetyNetFeeBps();
    const minThreshold = await contract.minFeeThreshold();
    
    let feeWei = 0n;
    if (amountWei >= minThreshold) {
      feeWei = (amountWei * feeBps) / 10000n;
    }
    
    const actionType = ACTION_LABELS.indexOf(snapshot.allowedAction);

    log(
      `Requesting execution for Policy #${policyId}: ${ethers.formatEther(amountWei)} BOT (plus ${ethers.formatEther(feeWei)} BOT fee) to ${snapshot.allowedDestination} (action: ${snapshot.allowedAction})...`,
    );

    try {
      // Send amount + fee to the contract
      const tx = await contract.executeRequest(
        policyId,
        amountWei,
        snapshot.allowedDestination,
        actionType,
        { value: amountWei + feeWei }
      );
      log(`Transaction submitted for Policy #${policyId}:`, tx.hash);
      const receipt = await tx.wait();

      const iface = new ethers.Interface(ABI);
      for (const eventLog of receipt.logs ?? []) {
        try {
          const parsed = iface.parseLog(eventLog);
          if (parsed?.name === "ExecutionApproved") {
            log(
              `✅ APPROVED (Policy #${policyId}) — ${ethers.formatEther(parsed.args.amount)} BOT sent. Remaining budget: ${ethers.formatEther(
                parsed.args.remainingBudget,
              )} BOT.`,
            );
          } else if (parsed?.name === "ExecutionRejected") {
            log(
              `❌ REJECTED (Policy #${policyId}) — reason: ${REJECT_REASON_LABELS[Number(parsed.args.reason)]}`,
            );
          }
        } catch {
          // not a Velora event, ignore
        }
      }
    } catch (execErr) {
      log(`Failed to execute request for Policy #${policyId}:`, execErr.message || String(execErr));
    }
    
    policyId++;
  }
}

async function main() {
  log("Velora Autonomous Agent starting.");
  log("Agent wallet address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  log("Agent wallet gas balance:", ethers.formatEther(balance), "BOT");
  if (balance === 0n) {
    log(
      "⚠️  Agent wallet has 0 BOT for gas — fund it before it can submit any transactions.",
    );
  }

  const runOnce = process.argv.includes("--once");

  await actOnce().catch((err) =>
    log("Error during cycle:", err.message ?? err),
  );

  if (runOnce) {
    log("Ran once (--once flag). Exiting.");
    return;
  }

  log(
    `Sleeping ${INTERVAL_MINUTES ?? 2} minute(s) between cycles. Press Ctrl+C to stop.`,
  );
  setInterval(() => {
    actOnce().catch((err) => log("Error during cycle:", err.message ?? err));
  }, intervalMs);
}

main();
