"use client";

import { Card } from "@/components/ui/card";
import { ActivityEvent } from "@/types/policy";
import { CheckCircle2, XCircle, FilePlus2, Ban, Banknote } from "lucide-react";
import { formatTimestamp, truncateAddress } from "@/lib/format";

const iconFor: Record<ActivityEvent["type"], any> = {
  PolicyCreated: FilePlus2,
  ExecutionApproved: CheckCircle2,
  ExecutionRejected: XCircle,
  PolicyCancelled: Ban,
  BudgetWithdrawn: Banknote,
};

const colorFor: Record<ActivityEvent["type"], string> = {
  PolicyCreated: "text-[var(--color-accent)]",
  ExecutionApproved: "text-[var(--color-success)]",
  ExecutionRejected: "text-[var(--color-danger)]",
  PolicyCancelled: "text-[var(--color-muted)]",
  BudgetWithdrawn: "text-[var(--color-accent)]",
};

const labelFor: Record<ActivityEvent["type"], string> = {
  PolicyCreated: "Policy created",
  ExecutionApproved: "Execution approved",
  ExecutionRejected: "Execution rejected",
  PolicyCancelled: "Policy cancelled",
  BudgetWithdrawn: "Budget withdrawn",
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <Card className="rounded-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Recent activity</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Live contract events</p>
        </div>
        <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">{events.length}</span>
      </div>
      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-rule)] bg-[var(--color-paper)] p-4 text-sm leading-6 text-[var(--color-muted)]">
          Nothing yet. Activity appears here as it happens on-chain.
        </p>
      ) : (
        <ul className="space-y-1">
          {events.slice(0, 8).map((e, i) => {
            const Icon = iconFor[e.type];
            return (
              <li key={`${e.txHash}-${i}`} className="flex gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-[var(--color-paper)]">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                  <Icon size={15} className={colorFor[e.type]} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[var(--color-ink)]">{labelFor[e.type]}</span>
                  <span className="mt-0.5 block truncate font-mono text-xs text-[var(--color-muted)]">
                    #{e.policyId.toString()} / {e.txHash ? truncateAddress(e.txHash, 5) : "pending"}
                  </span>
                </span>
                <span className="whitespace-nowrap text-xs text-[var(--color-muted)]">{formatTimestamp(e.timestamp)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
