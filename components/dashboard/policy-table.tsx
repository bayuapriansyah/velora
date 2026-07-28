"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Policy, PolicyStatus, STATUS_LABELS, ACTION_LABELS } from "@/types/policy";
import { formatBot, truncateAddress } from "@/lib/format";
import { Ban, WalletCards, Send, Clock3, Box, Route, Landmark } from "lucide-react";

const statusTone: Record<PolicyStatus, "approved" | "neutral" | "rejected"> = {
  [PolicyStatus.Active]: "approved",
  [PolicyStatus.Cancelled]: "neutral",
  [PolicyStatus.Expired]: "neutral",
  [PolicyStatus.Exhausted]: "neutral",
};

interface PolicyTableProps {
  policies: Policy[];
  onCancel: (id: bigint) => Promise<void>;
  onWithdraw: (id: bigint) => Promise<void>;
  busyId: string | null;
}

export function PolicyTable({ policies, onCancel, onWithdraw, busyId }: PolicyTableProps) {
  if (policies.length === 0) {
    return (
      <div className="col-span-12">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-rule)] bg-[var(--color-paper-2)] py-16">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            <Box size={22} />
          </span>
          <p className="mt-4 text-base font-semibold text-[var(--color-ink)]">No policies yet</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Create a policy to start authorizing agent requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                  Policy
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                  Budget
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                  Usage
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-rule)]">
              {policies.map((p) => {
                const spentPct =
                  p.totalBudget > 0n
                    ? Number(((p.totalBudget - p.remainingBudget) * 100n) / p.totalBudget)
                    : 0;
                const busy = busyId === p.id.toString();
                const execPct =
                  p.maxExecutions > 0n
                    ? Number((p.executionCount * 100n) / p.maxExecutions)
                    : 0;

                return (
                  <tr
                    key={p.id.toString()}
                    className="transition-colors hover:bg-[var(--color-paper)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)]">
                          <Route size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-ink)]">
                            {p.name || `Policy #${p.id}`}
                          </p>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                            <span>{ACTION_LABELS[p.allowedAction]}</span>
                            <span className="text-[var(--color-rule)]">/</span>
                            <span className="font-mono">
                              {truncateAddress(p.allowedDestination, 4)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                          {formatBot(p.remainingBudget)} BOT
                        </span>
                        <span className="text-xs text-[var(--color-muted)]">
                          of {formatBot(p.totalBudget)} BOT
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-40">
                        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock3 size={11} />
                            {p.executionCount.toString()}/{p.maxExecutions.toString()} exec
                          </span>
                          <span>{spentPct}%</span>
                        </div>
                        <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
                          {p.status === PolicyStatus.Active ? (
                            <div
                              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                              style={{ width: `${spentPct}%` }}
                            />
                          ) : (
                            <div
                              className="h-full rounded-full bg-[var(--color-muted)]"
                              style={{ width: `${spentPct}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === PolicyStatus.Active ? (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busy}
                              onClick={() => onCancel(p.id)}
                            >
                              <Ban size={13} />
                              Cancel
                            </Button>
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-success-soft)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-success)]">
                              <Send size={12} />
                              Armed
                            </span>
                          </>
                        ) : p.remainingBudget > 0n ? (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() => onWithdraw(p.id)}
                          >
                            <WalletCards size={13} />
                            Withdraw
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
