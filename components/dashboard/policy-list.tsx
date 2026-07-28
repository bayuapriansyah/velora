"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Policy, PolicyStatus, STATUS_LABELS, ACTION_LABELS } from "@/types/policy";
import { formatBot, formatDuration, truncateAddress } from "@/lib/format";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { Ban, Box, Clock3, Inbox, Landmark, Route, Send, WalletCards } from "lucide-react";

const statusTone: Record<PolicyStatus, "approved" | "neutral" | "rejected"> = {
  [PolicyStatus.Active]: "approved",
  [PolicyStatus.Cancelled]: "neutral",
  [PolicyStatus.Expired]: "neutral",
  [PolicyStatus.Exhausted]: "neutral",
};

export function PolicyList({ policies, onChanged }: { policies: Policy[]; onChanged: () => void }) {
  const { cancelPolicy, withdrawRemainingBudget } = useVeloraContract();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCancel(id: bigint) {
    setBusyId(id.toString());
    try {
      await cancelPolicy(id);
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleWithdraw(id: bigint) {
    setBusyId(id.toString());
    try {
      await withdrawRemainingBudget(id);
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  if (policies.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center rounded-xl py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Inbox size={24} />
        </div>
        <p className="mt-4 font-semibold text-[var(--color-ink)]">No policies yet</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--color-muted)]">Create one to start authorizing an agent&apos;s requests.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {policies.map((p) => {
        const spentPct = p.totalBudget > 0n ? Number(((p.totalBudget - p.remainingBudget) * 100n) / p.totalBudget) : 0;
        const busy = busyId === p.id.toString();
        return (
          <Card key={p.id.toString()} className="overflow-hidden rounded-xl p-0 transition-transform duration-150 hover:-translate-y-0.5">
            <div className="h-1 w-full bg-[var(--color-paper)]">
              <div className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-all duration-300" style={{ width: `${spentPct}%` }} />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-[var(--color-ink)]">{p.name || `Policy #${p.id}`}</h3>
                    <Badge tone={statusTone[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <Route size={15} className="shrink-0 text-[var(--color-accent)]" />
                      <span className="truncate">{ACTION_LABELS[p.allowedAction]}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      <Landmark size={15} className="shrink-0 text-[var(--color-accent)]" />
                      <span className="truncate font-mono">{truncateAddress(p.allowedDestination, 6)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 text-right sm:w-auto sm:min-w-64">
                  <div className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] p-3">
                    <p className="flex items-center justify-end gap-1.5 text-xs text-[var(--color-muted)]">
                      <Clock3 size={13} /> Expiry
                    </p>
                    <p className="mt-1 font-medium text-[var(--color-ink)]">{formatDuration(p.expiration)}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] p-3">
                    <p className="flex items-center justify-end gap-1.5 text-xs text-[var(--color-muted)]">
                      <Box size={13} /> Uses
                    </p>
                    <p className="mt-1 font-medium text-[var(--color-ink)]">
                      {p.executionCount.toString()}/{p.maxExecutions.toString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <div className="flex justify-between gap-3 text-xs text-[var(--color-muted)]">
                    <span>{formatBot(p.remainingBudget)} BOT remaining</span>
                    <span>{formatBot(p.totalBudget)} BOT total</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-all duration-300" style={{ width: `${spentPct}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {p.status === PolicyStatus.Active && (
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => handleCancel(p.id)}>
                      <Ban size={14} />
                      Cancel
                    </Button>
                  )}
                  {p.status !== PolicyStatus.Active && p.remainingBudget > 0n && (
                    <Button size="sm" disabled={busy} onClick={() => handleWithdraw(p.id)}>
                      <WalletCards size={14} />
                      Withdraw {formatBot(p.remainingBudget)}
                    </Button>
                  )}
                  {p.status === PolicyStatus.Active && (
                    <Button size="sm" variant="ghost" className="pointer-events-none text-[var(--color-success)]" disabled>
                      <Send size={14} />
                      Armed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
