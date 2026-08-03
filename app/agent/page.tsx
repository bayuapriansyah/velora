"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  Timer,
  Wallet,
  XCircle,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { usePolicies } from "@/hooks/usePolicies";
import { botScanLink } from "@/lib/network";
import { PolicyStatus } from "@/types/policy";

type AgentPolicyResult = {
  policyId: string;
  name: string;
  status: string;
  isDue: boolean;
  nextEligibleAt: string | null;
  secondsUntilDue: number;
  decision: { shouldRequest?: boolean; amountBot?: string; reasoning?: string } | null;
  reasoning: string;
  result: "approved" | "rejected" | "skipped" | "error";
  txHash?: string;
  rejectReason?: string;
  error?: string;
};

type AgentResponse = {
  logs?: string[];
  policies?: AgentPolicyResult[];
  error?: string;
};

const resultStyles: Record<AgentPolicyResult["result"], { label: string; className: string; icon: typeof Clock3 }> = {
  approved: {
    label: "Approved",
    className: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    icon: XCircle,
  },
  skipped: {
    label: "Skipped",
    className: "bg-[var(--color-paper)] text-[var(--color-muted)]",
    icon: Clock3,
  },
  error: {
    label: "Error",
    className: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    icon: AlertTriangle,
  },
};

function formatWait(seconds: number) {
  if (seconds <= 0) return "Ready now";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

function formatDate(value: string | null) {
  if (!value) return "Ready now";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentPage() {
  const { account, isCorrectNetwork, isConnecting, error: walletError, connect } = useWallet();
  const { policies, isLoading: policiesLoading } = usePolicies(account);
  const activePolicies = useMemo(
    () => policies.filter((p) => p.status === PolicyStatus.Active),
    [policies]
  );

  const [logs, setLogs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("velora_agent_logs");
      return saved ? JSON.parse(saved) : [`[${new Date().toISOString()}] Agent ready. Run a cycle to evaluate active policies.`];
    }
    return [`[${new Date().toISOString()}] Agent ready. Run a cycle to evaluate active policies.`];
  });
  const [results, setResults] = useState<AgentPolicyResult[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("velora_agent_results");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [lastError, setLastError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("velora_auto_run") === "true";
    return false;
  });
  const [autoRunInterval, setAutoRunInterval] = useState(() => {
    if (typeof window !== "undefined") return Number(localStorage.getItem("velora_auto_run_interval")) || 60000;
    return 60000;
  });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;

  useEffect(() => {
    localStorage.setItem("velora_agent_logs", JSON.stringify(logs.slice(-30)));
    localStorage.setItem("velora_agent_results", JSON.stringify(results));
    localStorage.setItem("velora_auto_run", String(autoRun));
    localStorage.setItem("velora_auto_run_interval", String(autoRunInterval));
  }, [logs, results, autoRun, autoRunInterval]);

  const readyCount = results.filter((p) => p.isDue).length;
  const notDueCount = results.filter((p) => !p.isDue).length;
  const txCount = results.filter((p) => p.txHash).length;
  const rejectedCount = results.filter((p) => p.result === "rejected").length;

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!autoRun) return;

    const interval = setInterval(() => {
      if (!isRunningRef.current) runAgent();
    }, autoRunInterval);

    return () => clearInterval(interval);
  }, [autoRun, autoRunInterval]);

  const runAgent = async () => {
    setIsRunning(true);
    setLastError(null);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toISOString()}] Initiating decision cycle for all active policies...`,
    ]);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as AgentResponse;

      if (data.policies) setResults(data.policies);
      if (data.logs) {
        const nextLogs = data.logs;
        setLogs((prev) => [...prev, ...nextLogs]);
      }
      if (data.error) {
        setLastError(data.error);
        setLogs((prev) => [...prev, `[${new Date().toISOString()}] ERROR: ${data.error}`]);
      }
    } catch (err: any) {
      const message = err.message || "Failed to contact agent endpoint.";
      setLastError(message);
      setLogs((prev) => [...prev, `[${new Date().toISOString()}] Network error: ${message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  if (!account) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 flex-col">
          <TopBar title="Autonomous Agent" />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-[var(--color-ink)]">Connect your wallet to manage the agent.</p>
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
          <TopBar title="Autonomous Agent" />
          <div className="flex flex-1 items-center justify-center">
            <p className="font-medium text-[var(--color-danger)]">Switch to BOT Chain to manage the agent.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="lg:ml-[280px] flex flex-1 flex-col">
        <TopBar title="Autonomous Agent" />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                  Agent Control Panel
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                  Run Cycle evaluates active policies. On-chain Activity updates only when the agent submits a transaction and the contract emits an event.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <select
                    className="h-8 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-2 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    value={autoRunInterval}
                    onChange={(e) => setAutoRunInterval(Number(e.target.value))}
                    disabled={autoRun}
                  >
                    <option value={5000}>5s (Demo)</option>
                    <option value={60000}>1m (Normal)</option>
                    <option value={300000}>5m</option>
                  </select>
                  <Button
                    variant={autoRun ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setAutoRun((value) => !value)}
                    className={autoRun ? "bg-[var(--color-success)] hover:opacity-90" : ""}
                  >
                    <Timer size={15} />
                    {autoRun ? "Auto-Run ON" : "Auto-Run OFF"}
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLogs([]);
                    setResults([]);
                    setLastError(null);
                  }}
                >
                  <RotateCcw size={15} />
                  Clear
                </Button>
                <Button size="sm" onClick={runAgent} disabled={isRunning}>
                  {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                  {isRunning ? "Running..." : "Run Cycle"}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <Activity size={14} />
                  Active Policies
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
                  {policiesLoading ? "..." : activePolicies.length}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <CheckCircle2 size={14} />
                  Ready
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--color-success)]">{readyCount}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <Clock3 size={14} />
                  Not Due
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--color-muted)]">{notDueCount}</p>
              </div>
              <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  <Wallet size={14} />
                  Submitted
                </div>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--color-accent)]">{txCount}</p>
              </div>
            </div>

            {lastError && (
              <div className="mt-5 rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                {lastError}
              </div>
            )}

            {autoRun && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent)]">
                <Bot size={16} />
                <span className="font-medium">Auto-Run is currently active and will persist across refreshes.</span>
              </div>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-5">
              <section className="xl:col-span-3 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
                <div className="border-b border-[var(--color-rule)] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Bot size={18} className="text-[var(--color-accent)]" />
                    <h2 className="font-semibold text-[var(--color-ink)]">Policy Decisions</h2>
                  </div>
                </div>

                {results.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                    No cycle results yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-rule)]">
                    {results.map((policy) => {
                      const style = resultStyles[policy.result];
                      const Icon = style.icon;
                      return (
                        <div key={policy.policyId} className="px-5 py-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-[var(--color-ink)]">
                                  {policy.name || `Policy #${policy.policyId}`}
                                </p>
                                <span className="rounded-full bg-[var(--color-paper)] px-2 py-0.5 font-mono text-xs text-[var(--color-muted)]">
                                  #{policy.policyId}
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}>
                                  <Icon size={12} />
                                  {style.label}
                                </span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                                {policy.result === "skipped" && !policy.isDue
                                  ? "No transaction submitted, so no on-chain activity event was emitted."
                                  : policy.result === "error"
                                  ? policy.error || policy.reasoning || "Execution failed."
                                  : policy.reasoning || policy.rejectReason || policy.error || "Cycle completed."}
                              </p>
                              {policy.rejectReason && (
                                <p className="mt-1 text-sm font-medium text-[var(--color-danger)]">
                                  Contract reject reason: {policy.rejectReason}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-left md:text-right">
                              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                                Next Eligible
                              </p>
                              <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                                {formatDate(policy.nextEligibleAt)}
                              </p>
                              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                                {formatWait(policy.secondsUntilDue)}
                              </p>
                            </div>
                          </div>

                          {policy.txHash && (
                            <a
                              href={botScanLink(`tx/${policy.txHash}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1 rounded-md bg-[var(--color-paper)] px-2 py-1 font-mono text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                            >
                              {policy.txHash.slice(0, 10)}...{policy.txHash.slice(-8)}
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="xl:col-span-2 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
                <div className="border-b border-[var(--color-rule)] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot size={18} className="text-[var(--color-accent)]" />
                      <h2 className="font-semibold text-[var(--color-ink)]">Agent Logs</h2>
                    </div>
                    {rejectedCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-danger-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                        <AlertTriangle size={12} />
                        {rejectedCount} rejected
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-h-[440px] max-h-[560px] overflow-y-auto bg-black p-4 font-mono text-xs leading-5 text-green-400 shadow-inner md:text-sm">
                  {logs.length === 0 ? (
                    <div className="text-gray-500">Logs cleared.</div>
                  ) : (
                    logs.map((log, i) => {
                      let displayLog = log;
                      if (log.toLowerCase().includes("initiating")) displayLog = `🚀 ${log}`;
                      else if (log.toLowerCase().includes("reading")) displayLog = `📄 ${log}`;
                      else if (log.toLowerCase().includes("status: active")) displayLog = `✅ ${log}`;
                      else if (log.toLowerCase().includes("budget")) displayLog = `💰 ${log}`;
                      else if (log.toLowerCase().includes("due")) displayLog = `📅 ${log}`;
                      else if (log.toLowerCase().includes("gemini")) displayLog = `🤖 ${log}`;
                      else if (log.toLowerCase().includes("approve")) displayLog = `✅ ${log}`;
                      else if (log.toLowerCase().includes("reject")) displayLog = `❌ ${log}`;
                      else if (log.toLowerCase().includes("sending transaction")) displayLog = `📤 ${log}`;
                      else if (log.toLowerCase().includes("transaction confirmed")) displayLog = `⛓ ${log}`;
                      else if (log.toLowerCase().includes("success")) displayLog = `✅ ${log}`;
                      else if (log.toLowerCase().includes("error")) displayLog = `❌ ${log}`;
                      else if (log.toLowerCase().includes("checking")) displayLog = `🔍 ${log}`;
                      else if (log.toLowerCase().includes("skipping")) displayLog = `⏭ ${log}`;
                      else if (log.toLowerCase().includes("finished")) displayLog = `🏁 ${log}`;
                      
                      return (
                        <div key={`${i}-${log.slice(0, 24)}`} className="mb-1 whitespace-pre-wrap">
                          {displayLog}
                        </div>
                      );
                    })
                  )}
                  {isRunning && (
                    <div className="mt-2 flex items-center gap-2 text-gray-500 animate-pulse">
                      <Loader2 size={16} />
                      Analyzing...
                    </div>
                  )}
                  <div ref={logsEndRef} />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
