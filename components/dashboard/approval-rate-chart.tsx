"use client";

import { Card } from "@/components/ui/card";
import { ActivityEvent } from "@/types/policy";
import { Gauge } from "lucide-react";

export function ApprovalRateChart({ events }: { events: ActivityEvent[] }) {
  const approved = events.filter((e) => e.type === "ExecutionApproved").length;
  const rejected = events.filter((e) => e.type === "ExecutionRejected").length;
  const total = approved + rejected;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <Card className="relative overflow-hidden rounded-xl">
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Gauge size={18} />
      </div>
      <p className="text-sm font-medium text-[var(--color-muted)]">Approval rate</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-[var(--color-ink)]">{total > 0 ? `${pct}%` : "-"}</p>
      <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-paper)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-[var(--color-muted)]">
        {approved} approved / {rejected} rejected
      </p>
    </Card>
  );
}
