"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bot, Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { formatBot, truncateAddress } from "@/lib/format";
import { botScanLink } from "@/lib/network";
import { FundAgentDialog } from "@/components/dashboard/fund-agent-dialog";

const LOW_GAS_THRESHOLD = BigInt("10000000000000000"); // 0.01 BOT — ~2 executions at 20 gwei

export function AgentWalletCard() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/status");
      const data = await res.json();
      if (!res.ok || !data.address) {
        throw new Error(data.error || "Agent wallet not configured");
      }
      setAddress(data.address);
      setBalance(BigInt(data.balance));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load agent wallet");
      setAddress(null);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lowGas = balance !== null && balance < LOW_GAS_THRESHOLD;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
            Agent Wallet
          </p>
          <div className="flex items-center gap-1.5">
            <FundAgentDialog address={address} onFunded={load} />
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
              <Bot size={10} strokeWidth={2} />
              gas-only
            </span>
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-[var(--color-muted)]">Loading…</p>}

        {!loading && error && (
          <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">{error}</p>
        )}

        {!loading && !error && address && (
          <div className="mt-4 space-y-3">
            <p className="font-mono text-sm font-semibold text-[var(--color-ink)]">
              {truncateAddress(address, 6)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
              >
                {copied ? (
                  <Check size={12} className="text-[var(--color-success)]" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? "Copied" : "Copy address"}
              </button>
              <a
                href={botScanLink(`address/${address}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
              >
                <ExternalLink size={12} />
                Explorer
              </a>
            </div>
            <div className="flex items-end justify-between border-t border-[var(--color-rule)] pt-3">
              <span className="text-xs text-[var(--color-muted)]">Balance</span>
              <span className="font-mono text-base font-semibold tabular-nums text-white">
                {balance !== null ? formatBot(balance) : "—"}
                <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">BOT</span>
              </span>
            </div>
            {lowGas && (
              <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-xs font-medium text-[var(--color-danger)]">
                <AlertTriangle size={12} />
                Low gas — fund this wallet
              </div>
            )}
            <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
              The agent signs executions with this gas-only wallet. It never touches policy
              budgets.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={load}
        disabled={loading}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all duration-150 hover:bg-[var(--color-paper)] disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  );
}
