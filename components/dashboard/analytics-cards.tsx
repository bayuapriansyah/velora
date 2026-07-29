"use client";

import { Shield, Gauge, Coins, Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatBot } from "@/lib/format";

interface AnalyticsCardsProps {
  totalPolicies: number;
  activePolicies: number;
  approvedEvents: number;
  rejectedEvents: number;
  totalBudget: bigint;
  remainingBudget: bigint;
}

function TrendBadge({ up, label }: { up: boolean; label: string }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        up
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
          : "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
      }`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}

function ApprovalRing({ pct }: { pct: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-paper)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-lg font-semibold tabular-nums text-[var(--color-ink)]">{pct}%</span>
    </div>
  );
}

const DECIMALS = 2;

export function AnalyticsCards({
  activePolicies,
  totalPolicies,
  approvedEvents,
  rejectedEvents,
  totalBudget,
  remainingBudget,
}: AnalyticsCardsProps) {
  const approvalsTotal = approvedEvents + rejectedEvents;
  const approvalPct = approvalsTotal > 0 ? Math.round((approvedEvents / approvalsTotal) * 100) : 0;
  const spentPct =
    totalBudget > 0n ? Number((((totalBudget - remainingBudget) * 100n) / totalBudget)) : 0;

  return (
    <div className="col-span-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 flex">
          <div className="flex-1 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Shield size={16} />
              </span>
              <TrendBadge up label={`${totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0}%`} />
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-[var(--color-ink)]">{activePolicies}</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              Active policies &middot; {totalPolicies} total
            </p>
          </div>
        </div>

        <div className="col-span-1 flex">
          <div className="flex-1 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Gauge size={16} />
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <ApprovalRing pct={approvalPct} />
              <div className="space-y-1.5">
                <p className="text-xs text-[var(--color-muted)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-success)] mr-1.5" />
                  {approvedEvents} approved
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-danger)] mr-1.5" />
                  {rejectedEvents} rejected
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">Approval rate</p>
          </div>
        </div>

        <div className="col-span-1 flex">
          <div className="flex-1 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
                <Coins size={16} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
              {remainingBudget > 0n ? formatBot(remainingBudget, DECIMALS) : "0"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Remaining budget</p>
            {totalBudget > 0n && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
              </div>
            )}
            {totalBudget > 0n && (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                {spentPct}% of {formatBot(totalBudget, DECIMALS)} BOT used
              </p>
            )}
          </div>
        </div>

        <div className="col-span-1 flex">
          <div className="flex-1 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-paper)] text-[var(--color-muted)]">
                <Activity size={16} />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
              {approvalsTotal}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">Total executions</p>
            {approvalsTotal > 0 && (
              <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
                <div
                  className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
                  style={{ width: `${approvalPct}%` }}
                />
                <div
                  className="h-full rounded-full bg-[var(--color-danger)] transition-all duration-500"
                  style={{ width: `${100 - approvalPct}%` }}
                />
              </div>
            )}
            {approvalsTotal > 0 && (
              <p className="mt-1 text-[11px] text-[var(--color-muted)]">
                {Math.round((approvedEvents / approvalsTotal) * 100)}% approved
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
