"use client";

import {
  CheckCircle2,
  XCircle,
  FilePlus2,
  Ban,
  Banknote,
  ExternalLink,
} from "lucide-react";
import type { ActivityEvent } from "@/types/policy";
import { truncateAddress } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent extends ActivityEvent {
  _timeAgo: string;
}

const HOUR_MS = 3600000;

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts * 1000;
  if (diff < HOUR_MS) return `${Math.floor(diff / 60000)}m`;
  if (diff < 24 * HOUR_MS) return `${Math.floor(diff / HOUR_MS)}h`;
  return `${Math.floor(diff / (24 * HOUR_MS))}d`;
}

const eventConfig: Record<
  ActivityEvent["type"],
  { icon: typeof CheckCircle2; color: string; bg: string; label: string; badge: "approved" | "rejected" | "neutral" }
> = {
  PolicyCreated: {
    icon: FilePlus2,
    color: "text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)]",
    label: "Policy created",
    badge: "neutral",
  },
  ExecutionApproved: {
    icon: CheckCircle2,
    color: "text-[var(--color-success)]",
    bg: "bg-[var(--color-success-soft)]",
    label: "Execution approved",
    badge: "approved",
  },
  ExecutionRejected: {
    icon: XCircle,
    color: "text-[var(--color-danger)]",
    bg: "bg-[var(--color-danger-soft)]",
    label: "Execution rejected",
    badge: "rejected",
  },
  PolicyCancelled: {
    icon: Ban,
    color: "text-[var(--color-muted)]",
    bg: "bg-[var(--color-paper)]",
    label: "Policy cancelled",
    badge: "neutral",
  },
  BudgetWithdrawn: {
    icon: Banknote,
    color: "text-[var(--color-warning)]",
    bg: "bg-[var(--color-warning-soft)]",
    label: "Budget withdrawn",
    badge: "neutral",
  },
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
  approvedCount: number;
  rejectedCount: number;
}

export function ActivityTimeline({ events, approvedCount, rejectedCount }: ActivityTimelineProps) {
  const totalEvents = approvedCount + rejectedCount;
  const approvalPct = totalEvents > 0 ? Math.round((approvedCount / totalEvents) * 100) : 0;

  const enriched: TimelineEvent[] = events
    .slice(0, 10)
    .map((e) => ({ ...e, _timeAgo: formatTimeAgo(e.timestamp) }));

  return (
    <div className="col-span-12 lg:col-span-8">
      <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
        <div className="border-b border-[var(--color-rule)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Activity Timeline</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">Latest on-chain events</p>
            </div>
            {enriched.length > 0 && (
              <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                {enriched.length}
              </span>
            )}
          </div>
        </div>
        {enriched.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--color-muted)]">
            No events yet. Activity appears here as it happens on-chain.
          </div>
        ) : (
          <div className="px-6 py-5">
            <div className="relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--color-rule)]" />
              <div className="space-y-4">
                {enriched.map((e, i) => {
                  const cfg = eventConfig[e.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={`${e.txHash}-${i}`} className="relative flex gap-4">
                      <span
                        className={`relative z-10 mt-0.5 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-[var(--color-rule)] ${cfg.bg}`}
                      >
                        <Icon size={15} className={cfg.color} />
                      </span>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--color-ink)]">
                              {cfg.label}
                            </p>
                            <Badge tone={cfg.badge} className="text-[10px]">
                              #{e.policyId.toString()}
                            </Badge>
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-[var(--color-muted)]">
                            {e._timeAgo}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          {e.txHash && (
                            <a
                              href={`https://botchain.explorer/tx/${e.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent-soft)]"
                            >
                              {truncateAddress(e.txHash, 4)}
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
