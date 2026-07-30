"use client";

import { Fragment, useState, useEffect } from "react";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Policy, PolicyStatus, STATUS_LABELS, ACTION_LABELS } from "@/types/policy";
import { formatBot, truncateAddress, formatTimestamp } from "@/lib/format";
import {
  Ban,
  WalletCards,
  Send,
  Clock3,
  Box,
  Route,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
  CalendarClock,
  Repeat2,
  Wallet,
  LifeBuoy,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

function formatNextExecution(lastExecTime: bigint, interval: bigint): string {
  if (interval === 0n) return "—";
  const lastSec = Number(lastExecTime);
  const intervalSec = Number(interval);
  const nowSec = Math.floor(Date.now() / 1000);
  if (lastSec === 0) return "Ready now";
  const nextSec = lastSec + intervalSec;
  if (nextSec <= nowSec) return "Ready now";
  const diffSec = nextSec - nowSec;
  const diffDays = Math.floor(diffSec / 86400);
  const diffHours = Math.floor((diffSec % 86400) / 3600);
  if (diffDays > 0) return `in ${diffDays}d ${diffHours}h`;
  const diffMin = Math.floor(diffSec / 60);
  return `in ${diffMin}m`;
}

interface PolicyTableProps {
  policies: Policy[];
  onCancel: (id: bigint) => Promise<void>;
  onWithdraw: (id: bigint) => Promise<void>;
  busyId: string | null;
}

const statusTone: Record<PolicyStatus, "approved" | "neutral" | "rejected"> = {
  [PolicyStatus.Active]: "approved",
  [PolicyStatus.Cancelled]: "neutral",
  [PolicyStatus.Expired]: "neutral",
  [PolicyStatus.Exhausted]: "neutral",
};

function formatIntervalDays(seconds: bigint): string {
  const totalSeconds = Number(seconds);
  if (totalSeconds === 0) return "—";
  const days = Math.round(totalSeconds / 86400);
  if (days === 1) return "Daily";
  if (days === 7) return "Weekly";
  if (days === 30) return "Monthly";
  return `Every ${days} days`;
}

export function PolicyTable({ policies, onCancel, onWithdraw, busyId }: PolicyTableProps) {
  const { getPolicySafetyNetInfo, claimFromSafetyNet } = useVeloraContract();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [safetyNetInfo, setSafetyNetInfo] = useState<Record<string, { quota: bigint; cooldownEnds: bigint }>>({});
  const pageSize = 10;

  const totalPages = Math.ceil(policies.length / pageSize);
  const paginatedPolicies = policies.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    policies.forEach(async (p) => {
      try {
        const info = await getPolicySafetyNetInfo(p.id);
        setSafetyNetInfo(prev => ({
          ...prev,
          [p.id.toString()]: { quota: info.quota, cooldownEnds: info.cooldownEnds }
        }));
      } catch (e) {
        console.error("Error fetching safety net info", e);
      }
    });
  }, [policies, getPolicySafetyNetInfo]);

  async function handleClaim(id: bigint, amount: bigint) {
    try {
      await claimFromSafetyNet(id, amount, "Policy SafetyNet Claim");
      alert("Claim successful!");
    } catch (e: any) {
      alert(`Claim failed: ${e.message || "Unknown error"}`);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

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
    <div className="col-span-12 w-full min-w-0">
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
        <table className="w-full min-w-[900px]">
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
                Amt/Exec
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Frequency
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
            {paginatedPolicies.map((p) => {
              const spentPct =
                p.totalBudget > 0n
                  ? Number(((p.totalBudget - p.remainingBudget) * 100n) / p.totalBudget)
                  : 0;
              const busy = busyId === p.id.toString();
              const isExpanded = expandedId === p.id.toString();

              // Kalkulasi: totalAllocated = amountPerExecution × maxExecutions
              const amountPerExec = p.amountPerExecution ?? 0n;
              const totalAllocated = amountPerExec * p.maxExecutions;
              const totalSpentExec = amountPerExec * p.executionCount;

              return (
                <Fragment key={p.id.toString()}>
                  <tr
                    className="cursor-pointer transition-colors hover:bg-[var(--color-paper)]"
                    onClick={() => toggleExpand(p.id.toString())}
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
                      <Badge tone={statusTone[p.status] as "approved" | "neutral" | "rejected"}>{STATUS_LABELS[p.status]}</Badge>
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
                      <span className="font-mono text-sm font-semibold text-[var(--color-ink)]">
                        {amountPerExec > 0n ? `${formatBot(amountPerExec)} BOT` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[var(--color-ink)]">
                        {formatIntervalDays(p.paymentInterval ?? 0n)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-36">
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
                              onClick={(e) => { e.stopPropagation(); onCancel(p.id); }}
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
                            onClick={(e) => { e.stopPropagation(); onWithdraw(p.id); }}
                          >
                            <WalletCards size={13} />
                            Withdraw
                          </Button>
                        ) : null}
                        <span className="ml-1 text-[var(--color-muted)]">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <tr className="bg-[var(--color-paper)]">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          {/* Budget Breakdown */}
                          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                              <Wallet size={12} />
                              Budget Breakdown
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Total budget</span>
                                <span className="font-mono font-semibold text-[var(--color-ink)]">{formatBot(p.totalBudget)} BOT</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Allocated ({p.maxExecutions.toString()}×)</span>
                                <span className="font-mono font-semibold text-[var(--color-ink)]">
                                  {amountPerExec > 0n ? `${formatBot(totalAllocated)} BOT` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Spent so far</span>
                                <span className="font-mono font-semibold text-[var(--color-danger)]">
                                  {amountPerExec > 0n ? `${formatBot(totalSpentExec)} BOT` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-[var(--color-rule)] pt-1.5 mt-1.5">
                                <span className="text-[var(--color-muted)] text-xs">SafetyNet Quota</span>
                                <span className="font-mono font-semibold text-[var(--color-accent)] text-xs">
                                  {safetyNetInfo[p.id.toString()] ? formatBot(safetyNetInfo[p.id.toString()].quota) : "0"} BOT
                                </span>
                              </div>
                              {safetyNetInfo[p.id.toString()] && safetyNetInfo[p.id.toString()].quota > 0n && (
                                <Button 
                                  size="sm" 
                                  className="w-full mt-2" 
                                  onClick={(e) => { e.stopPropagation(); handleClaim(p.id, safetyNetInfo[p.id.toString()].quota); }}
                                >
                                  Claim Refund
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Schedule */}
                          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                              <Repeat2 size={12} />
                              Schedule
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Frequency</span>
                                <span className="font-semibold text-[var(--color-ink)]">{formatIntervalDays(p.paymentInterval ?? 0n)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Per execution</span>
                                <span className="font-mono font-semibold text-[var(--color-ink)]">
                                  {amountPerExec > 0n ? `${formatBot(amountPerExec)} BOT` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Next execution</span>
                                <span className="font-semibold text-[var(--color-accent)]">
                                  {formatNextExecution(p.lastExecutionTime ?? 0n, p.paymentInterval ?? 0n)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Last executed</span>
                                <span className="text-[var(--color-ink)]">
                                  {(p.lastExecutionTime ?? 0n) > 0n ? formatTimestamp(p.lastExecutionTime!) : "Never"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Execution Stats */}
                          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                              <Zap size={12} />
                              Executions
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Completed</span>
                                <span className="font-semibold text-[var(--color-ink)]">{p.executionCount.toString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Max allowed</span>
                                <span className="font-semibold text-[var(--color-ink)]">{p.maxExecutions.toString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Remaining</span>
                                <span className="font-semibold text-[var(--color-accent)]">
                                  {(p.maxExecutions - p.executionCount).toString()} left
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Policy Info */}
                          <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">
                              <CalendarClock size={12} />
                              Policy Info
                            </div>
                            <div className="mt-3 space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Policy ID</span>
                                <span className="font-mono font-semibold text-[var(--color-ink)]">#{p.id.toString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Action</span>
                                <span className="font-semibold text-[var(--color-ink)]">{ACTION_LABELS[p.allowedAction]}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-muted)]">Expires</span>
                                <span className="text-[var(--color-ink)]">{formatTimestamp(p.expiration)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[var(--color-muted)]">Destination</span>
                                <a
                                  href={`https://scan.bohr.life/address/${p.allowedDestination}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 font-mono text-[var(--color-accent)] hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {truncateAddress(p.allowedDestination, 4)}
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
