import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

type AgentPolicyResult = {
  policyId: string;
  name: string;
  status: string;
  isDue: boolean;
  nextEligibleAt: string | null;
  secondsUntilDue: number;
  decision: any | null;
  reasoning: string;
  result: "approved" | "rejected" | "skipped" | "error";
  txHash?: string;
  rejectReason?: string;
  error?: string;
};

const ACTION_LABELS = ["Transfer", "Swap", "ContractCall"];
const STATUS_LABELS = ["Active", "Cancelled", "Expired", "Exhausted"];
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

function loadAgentEnv(): Record<string, string> {
  const fromProcess: Record<string, string | undefined> = {
    RPC_URL: process.env.RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    AGENT_PRIVATE_KEY: process.env.AGENT_PRIVATE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  };
  if (Object.values(fromProcess).every(Boolean)) {
    return fromProcess as Record<string, string>;
  }
  try {
    return dotenv.parse(readFileSync(join(process.cwd(), "agent", ".env")));
  } catch {
    return {};
  }
}

function toFriendlyError(err: any): string {
  const raw = String(err?.message ?? err ?? "");
  if (/insufficient funds/i.test(raw)) {
    return "Agent wallet has insufficient BOT for gas — top it up via Fund gas.";
  }
  if (/insufficient balance/i.test(raw)) {
    return "Agent wallet has insufficient BOT for gas — top it up via Fund gas.";
  }
  if (/execution reverted/i.test(raw)) {
    const short = typeof err?.shortMessage === "string" ? err.shortMessage : "";
    return short || "Execution reverted by the contract — see agent logs.";
  }
  if (/nonce too low/i.test(raw)) {
    return "Transaction nonce conflict — run the cycle again.";
  }
  if (/replaced/i.test(raw)) {
    return "Transaction was replaced — check status and retry.";
  }
  if (/already known|already imported/i.test(raw)) {
    return "Transaction already submitted — check status.";
  }
  return "Execution failed — see agent logs.";
}

export async function POST(request: Request) {
  const logs: string[] = [];
  const policies: AgentPolicyResult[] = [];
  const log = (...args: any[]) => {
    const message = `[${new Date().toISOString()}] ${args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
      .join(" ")}`;
    console.log(message);
    logs.push(message);
  };

  try {
    const body = await request.json().catch(() => ({}));

    const envConfig = loadAgentEnv();

    const {
      RPC_URL,
      CONTRACT_ADDRESS,
      AGENT_PRIVATE_KEY,
      GEMINI_API_KEY,
    } = envConfig;

    if (!RPC_URL || !AGENT_PRIVATE_KEY || !GEMINI_API_KEY) {
      throw new Error("Missing required environment variables (process.env or agent/.env)");
    }

    const isValidAddress = (a: any): a is string =>
      typeof a === "string" && /^0x[a-fA-F0-9]{40}$/.test(a.trim());

    const contractAddress = isValidAddress(body?.contractAddress)
      ? body.contractAddress.trim()
      : CONTRACT_ADDRESS;

    if (!contractAddress) {
      throw new Error("Missing contract address: set CONTRACT_ADDRESS env or pass contractAddress in the request body.");
    }

    const ABI = JSON.parse(readFileSync(join(process.cwd(), "agent", "abi.json"), "utf-8"));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(contractAddress, ABI, wallet);
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    log("Velora Autonomous Agent cycle starting.");
    log("Agent wallet address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    log("Agent wallet gas balance:", ethers.formatEther(balance), "BOT");

    if (balance === 0n) {
      log("WARNING: Agent wallet has 0 BOT for gas. Fund it before it can submit transactions.");
    }

    log("Checking all policies on-chain...");
    let policyId = 0n;

    while (true) {
      let p;
      try {
        p = await contract.getPolicy(policyId);
      } catch {
        break;
      }

      const snapshot = {
        id: p.id.toString(),
        name: p.name,
        remainingBudgetBot: ethers.formatEther(p.remainingBudget),
        totalBudgetBot: ethers.formatEther(p.totalBudget),
        allowedDestination: p.allowedDestination,
        allowedAction: ACTION_LABELS[Number(p.allowedAction)],
        expiration: new Date(Number(p.expiration) * 1000).toISOString(),
        maxExecutions: p.maxExecutions.toString(),
        executionCount: p.executionCount.toString(),
        status: STATUS_LABELS[Number(p.status)] ?? "Unknown",
        amountPerExecutionBot: ethers.formatEther(p.amountPerExecution),
        paymentIntervalSeconds: p.paymentInterval.toString(),
        lastExecutionTime: p.lastExecutionTime.toString(),
      };

      if (snapshot.status !== "Active") {
        policyId++;
        continue;
      }

      const lastExecutionTime = Number(p.lastExecutionTime);
      const paymentInterval = Number(p.paymentInterval);
      const nowSeconds = Math.floor(Date.now() / 1000);
      const nextEligibleSeconds =
        lastExecutionTime === 0 ? nowSeconds : lastExecutionTime + paymentInterval;
      const secondsUntilDue = Math.max(0, nextEligibleSeconds - nowSeconds);
      const isDue = lastExecutionTime === 0 || secondsUntilDue === 0;

      const policyResult: AgentPolicyResult = {
        policyId: policyId.toString(),
        name: snapshot.name,
        status: snapshot.status,
        isDue,
        nextEligibleAt: lastExecutionTime === 0 ? null : new Date(nextEligibleSeconds * 1000).toISOString(),
        secondsUntilDue,
        decision: null,
        reasoning: "",
        result: "skipped",
      };
      policies.push(policyResult);

      log(`Analyzing Policy #${policyId} (${snapshot.name})...`);

      if (!isDue) {
        policyResult.reasoning = `Payment interval has not elapsed. Next eligible at ${policyResult.nextEligibleAt}.`;
        log(`Policy #${policyId} - Not due yet. ${policyResult.reasoning}`);
        policyId++;
        continue;
      }

      const amountPerExecutionBot = ethers.formatEther(p.amountPerExecution);
      const prompt = `You are an autonomous spending agent operating under a strict on-chain policy.
You may only ever suggest requesting a transaction; a smart contract is the sole authority
that approves or rejects it based on rules you cannot change.

Current policy state:
${JSON.stringify(snapshot, null, 2)}

The mandatory amount for each execution is exactly ${amountPerExecutionBot} BOT — this cannot be changed.

Decide whether the agent should attempt an execution request right now. Consider:
- Is the policy still Active?
- Is there enough remaining budget for amountPerExecutionBot?
- Have executions already reached the maximum?
- Is the current time past (lastExecutionTime + paymentIntervalSeconds)? Current time in seconds is ${Math.floor(Date.now() / 1000)}. (If lastExecutionTime is 0, it means it has never executed, so it is ready now).

Respond with ONLY a JSON object, no markdown, no explanation outside the JSON:
{"shouldRequest": true|false, "reasoning": "<one short sentence>"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonText = text.replace(/^```json\s*|\s*```$/g, "");

      let decision;
      try {
        decision = JSON.parse(jsonText);
      } catch {
        log(`[gemini] Policy #${policyId} - Could not parse response, defaulting to no action. Raw response:`, text);
        decision = { shouldRequest: false, reasoning: "Failed to parse model response." };
      }

      policyResult.decision = decision;
      policyResult.reasoning = String(decision.reasoning || "");
      log(`Gemini decision for Policy #${policyId}:`, decision);

      if (!decision.shouldRequest) {
        policyResult.result = "skipped";
        log(`Policy #${policyId} - Gemini decided not to request this cycle. Reason:`, decision.reasoning);
        policyId++;
        continue;
      }

      const fresh = await contract.getPolicy(policyId);
      if (fresh.executionCount !== p.executionCount) {
        policyResult.result = "skipped";
        policyResult.reasoning = `Another cycle already executed this policy (count: ${fresh.executionCount}).`;
        log(`Policy #${policyId} - Skipping: execution count changed (${p.executionCount} → ${fresh.executionCount}).`);
        policyId++;
        continue;
      }
      if (Number(fresh.status) !== 0) {
        policyResult.result = "skipped";
        policyResult.reasoning = `Policy is no longer active (status: ${STATUS_LABELS[Number(fresh.status)]}).`;
        log(`Policy #${policyId} - Skipping: status changed to ${STATUS_LABELS[Number(fresh.status)]}.`);
        policyId++;
        continue;
      }

      const amountWei = p.amountPerExecution;
      log(`Requesting execution for Policy #${policyId}: ${ethers.formatEther(amountWei)} BOT to ${p.allowedDestination} (action: ${ACTION_LABELS[Number(p.allowedAction)]})...`);

      try {
        const iface = new ethers.Interface(ABI);
        const data = iface.encodeFunctionData("executeRequest", [policyId, amountWei, p.allowedDestination, Number(p.allowedAction)]);
        const tx = await wallet.sendTransaction({
          to: contractAddress,
          data,
          gasLimit: 300000,
        });
        policyResult.txHash = tx.hash;
        log(`Transaction submitted for Policy #${policyId}:`, tx.hash);
        const receipt = await tx.wait();

        if (receipt) {
          for (const eventLog of receipt.logs ?? []) {
            try {
              const parsed = iface.parseLog(eventLog);
              if (parsed?.name === "ExecutionApproved") {
                policyResult.result = "approved";
                log(`APPROVED (Policy #${policyId}) - ${ethers.formatEther(parsed.args.amount)} BOT sent. Remaining budget: ${ethers.formatEther(parsed.args.remainingBudget)} BOT.`);
              } else if (parsed?.name === "ExecutionRejected") {
                policyResult.result = "rejected";
                policyResult.rejectReason = REJECT_REASON_LABELS[Number(parsed.args.reason)] ?? "Unknown";
                log(`REJECTED (Policy #${policyId}) - reason: ${policyResult.rejectReason}`);
              }
            } catch {
              // Ignore logs from other contracts.
            }
          }
        }
      } catch (execErr: any) {
        const raw = execErr?.message || String(execErr);
        policyResult.result = "error";
        policyResult.error = toFriendlyError(execErr);
        log(`Failed to execute request for Policy #${policyId}:`, raw);
      }

      policyId++;
    }

    log("Cycle finished.");
    return NextResponse.json({ logs, policies });
  } catch (error: any) {
    log("Error during cycle:", error.message || String(error));
    return NextResponse.json({ logs, policies, error: error.message }, { status: 500 });
  }
}
