"use client";

import { useMemo, useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { Button } from "@/components/ui/button";
import { RequestBuilder } from "@/components/simulation/request-builder";
import { ValidationTimeline, TimelineRule } from "@/components/simulation/validation-timeline";
import { ResultPanel, SimulationResult } from "@/components/simulation/result-panel";
import { ShareResult } from "@/components/simulation/share-result";
import { useWallet } from "@/hooks/useWallet";
import { usePolicies } from "@/hooks/usePolicies";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { predictExecution } from "@/utils/validation";
import { formatBot, botToWei } from "@/lib/format";
import { ActionType, RejectReason } from "@/types/policy";
import { Interface, parseEther } from "ethers";
import VeloraAbi from "@/contracts/Velora.abi.json";



function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function SimulationPage() {
  const { account, isCorrectNetwork, isConnecting, error: walletError, connect } = useWallet();
  const { policies, refresh } = usePolicies(account);
  const { executeRequest } = useVeloraContract();
  const [agentBalance, setAgentBalance] = useState<bigint>(0n);
  const [agentAddress, setAgentAddress] = useState<string>("");

  useEffect(() => {
    fetch("/api/agent/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.address && data.balance) {
          setAgentAddress(data.address);
          setAgentBalance(BigInt(data.balance));
        }
      })
      .catch(() => {});
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionType>(ActionType.Transfer);
  const [rules, setRules] = useState<TimelineRule[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPolicy = useMemo(
    () => policies.find((p) => p.id.toString() === selectedId) ?? null,
    [policies, selectedId]
  );

  function selectPolicy(id: string) {
    setSelectedId(id);
    const p = policies.find((pol) => pol.id.toString() === id);
    if (p) {
      setSelectedAction(p.allowedAction);
      // Auto-fill amount from the policy's amountPerExecution
      const amountBot = p.amountPerExecution ? (Number(p.amountPerExecution) / 1e18).toString() : "";
      setAmount(amountBot);
    }
  }

  async function runSimulation(overrideAmountBot: string, action: ActionType) {
    if (!selectedPolicy) return;
    setError(null);
    setResult(null);
    setIsRunning(true);

    const amountWei = botToWei(overrideAmountBot);
    const prediction = predictExecution(selectedPolicy, amountWei, selectedPolicy.allowedDestination, action);

    const initial: TimelineRule[] = prediction.ruleResults.map((r) => ({ label: r.rule, state: "pending" }));
    setRules(initial);

    for (let i = 0; i < prediction.ruleResults.length; i++) {
      const r = prediction.ruleResults[i];
      setRules((prev) => prev.map((rule, idx) => (idx === i ? { ...rule, state: "checking" } : rule)));
      await delay(350);
      setRules((prev) =>
        prev.map((rule, idx) => (idx === i ? { ...rule, state: r.passed ? "passed" : "failed" } : rule))
      );
      if (!r.passed) break;
      await delay(150);
    }

    if (prediction.isAiRejection) {
      setResult({
        approved: false,
        aiReason: prediction.aiReason,
        amountWei,
        txHash: "AI_SIMULATION",
      });
      setIsRunning(false);
      return;
    }

    try {
      const receipt = await executeRequest(
        selectedPolicy.id,
        amountWei,
        selectedPolicy.allowedDestination,
        action
      );

      const iface = new Interface(VeloraAbi as any);
      let parsed: SimulationResult = {
        approved: false,
        amountWei,
        txHash: receipt?.hash ?? "",
      };

      if (receipt) {
        for (const log of receipt.logs ?? []) {
          try {
            const decoded = iface.parseLog(log);
            if (decoded?.name === "ExecutionApproved") {
              parsed = {
                approved: true,
                amountWei: decoded.args.amount,
                remainingBudgetWei: decoded.args.remainingBudget,
                txHash: receipt.hash,
              };
            } else if (decoded?.name === "ExecutionRejected") {
              parsed = {
              approved: false,
              reason: Number(decoded.args.reason) as RejectReason,
              amountWei: decoded.args.attemptedAmount,
              txHash: receipt.hash,
            };
          }
        } catch {
          // not a Velora event, skip
        }
      }
      }

      setResult(parsed);
      refresh();
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.message ?? "Transaction failed.");
    } finally {
      setIsRunning(false);
    }
  }

  function runValid() {
    if (!selectedPolicy) return;
    // Always use the policy's amountPerExecution for the valid simulation
    const amountBot = selectedPolicy.amountPerExecution
      ? (Number(selectedPolicy.amountPerExecution) / 1e18).toString()
      : amount;
    runSimulation(amountBot, selectedAction);
  }

  function runInvalid() {
    if (!selectedPolicy) return;
    // Overspend: try to send more than the remaining budget
    const overspendWei = selectedPolicy.remainingBudget + parseEther("0.001");
    const overspendBot = (Number(overspendWei) / 1e18).toString();
    setAmount(overspendBot);
    runSimulation(overspendBot, selectedAction);
  }

  function runWrongAction() {
    if (!selectedPolicy) return;
    const wrongAction = ([ActionType.Transfer, ActionType.Swap, ActionType.ContractCall] as ActionType[]).find(
      (a) => a !== selectedPolicy.allowedAction
    )!;
    setSelectedAction(wrongAction);
    runSimulation(amount || "0.001", wrongAction);
  }

  if (!account) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 flex-col">
          <TopBar title="Simulation" />
          <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="font-medium text-[var(--color-ink)]">Connect your wallet to run a simulation.</p>
            <Button className="mt-4" onClick={connect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
            {walletError && (
              <p className="mt-3 text-sm font-medium text-[var(--color-danger)]">{walletError}</p>
            )}
          </div>
        </div>
      </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
        <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 flex-col">
          <TopBar title="Simulation" />
          <div className="flex flex-1 items-center justify-center">
            <p className="font-medium text-[var(--color-danger)]">Switch to BOT Chain to run a simulation.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="lg:ml-[280px] flex flex-1 flex-col">
        <TopBar title="Simulation" />
        <div className="flex flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Simulation</h1>
        <p className="mt-1 max-w-lg text-[var(--color-muted)]">
          A stand-in for an agent SDK — every request below is a real transaction to Velora.sol on BOT Chain.
          Nothing here is faked client-side.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <RequestBuilder
            policies={policies}
            selectedId={selectedId}
            onSelect={selectPolicy}
            amount={amount}
            onAmountChange={setAmount}
            selectedAction={selectedAction}
            onActionChange={setSelectedAction}
            onRunValid={runValid}
            onRunInvalid={runInvalid}
            onRunWrongAction={runWrongAction}
            isRunning={isRunning}
          />

          <div className="space-y-6">
            <div className="bg-[var(--color-paper-2)] p-5 rounded-xl border border-[var(--color-rule)]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Agent Balance</p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-accent)]">{formatBot(agentBalance)} BOT</p>
              {agentAddress && (
                <p className="mt-1 text-xs font-mono text-[var(--color-muted)] truncate">{agentAddress}</p>
              )}
            </div>
            <ValidationTimeline rules={rules} isIdle={rules.length === 0} />
            {error && <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>}
            <ResultPanel result={result} />
            {result && selectedPolicy && (
              <ShareResult result={result} policyName={selectedPolicy.name || `Policy #${selectedPolicy.id}`} />
            )}
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
