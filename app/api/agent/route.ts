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
    await request.json().catch(() => ({}));

    const envPath = join(process.cwd(), "agent", ".env");
    const envConfig = dotenv.parse(readFileSync(envPath));

    const {
      RPC_URL,
      CONTRACT_ADDRESS,
      AGENT_PRIVATE_KEY,
      GEMINI_API_KEY,
      REQUEST_AMOUNT_BOT,
    } = envConfig;

    if (!RPC_URL || !CONTRACT_ADDRESS || !AGENT_PRIVATE_KEY || !GEMINI_API_KEY) {
      throw new Error("Missing required environment variables in agent/.env");
    }

    const suggestedAmountBot = REQUEST_AMOUNT_BOT ?? "0.01";
    const ABI = JSON.parse(readFileSync(join(process.cwd(), "agent", "abi.json"), "utf-8"));

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
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

      const prompt = `You are an autonomous spending agent operating under a strict on-chain policy.
You may only ever suggest requesting a transaction; a smart contract is the sole authority
that approves or rejects it based on rules you cannot change.

Current policy state:
${JSON.stringify(snapshot, null, 2)}

Suggested request amount if you decide to act: ${suggestedAmountBot} BOT

Decide whether the agent should attempt an execution request right now. Consider:
- Is the policy still Active?
- Is there enough remaining budget for amountPerExecutionBot?
- Have executions already reached the maximum?
- Is the current time past (lastExecutionTime + paymentIntervalSeconds)? Current time in seconds is ${Math.floor(Date.now() / 1000)}. (If lastExecutionTime is 0, it means it has never executed, so it is ready now).
- Is the suggested request amount exactly equal to amountPerExecutionBot?

Respond with ONLY a JSON object, no markdown, no explanation outside the JSON:
{"shouldRequest": true|false, "amountBot": "<number as string, must be exactly amountPerExecutionBot>", "reasoning": "<one short sentence>"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonText = text.replace(/^```json\s*|\s*```$/g, "");

      let decision;
      try {
        decision = JSON.parse(jsonText);
      } catch {
        log(`[gemini] Policy #${policyId} - Could not parse response, defaulting to no action. Raw response:`, text);
        decision = { shouldRequest: false, amountBot: "0", reasoning: "Failed to parse model response." };
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

      const amountWei = ethers.parseEther(String(decision.amountBot || suggestedAmountBot));
      log(`Requesting execution for Policy #${policyId}: ${ethers.formatEther(amountWei)} BOT to ${p.allowedDestination} (action: ${ACTION_LABELS[Number(p.allowedAction)]})...`);

      try {
        const tx = await contract.executeRequest(policyId, amountWei, p.allowedDestination, Number(p.allowedAction));
        policyResult.txHash = tx.hash;
        log(`Transaction submitted for Policy #${policyId}:`, tx.hash);
        const receipt = await tx.wait();

        const iface = new ethers.Interface(ABI);
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
      } catch (execErr: any) {
        policyResult.result = "error";
        policyResult.error = execErr.message || String(execErr);
        log(`Failed to execute request for Policy #${policyId}:`, policyResult.error);
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
