import React from "react";
import { Card } from "@/components/ui/card";
import { formatEther } from "ethers";

interface SafetyNetWidgetProps {
  stats: {
    pool: bigint;
    totalFees: bigint;
    totalSeeded: bigint;
    totalClaims: bigint;
  };
}

export function SafetyNetWidget({ stats }: SafetyNetWidgetProps) {
  return (
    <Card className="col-span-1">
      <div className="mb-2">
        <h3 className="text-sm font-medium text-[var(--color-muted)]">SafetyNet Pool</h3>
      </div>
      <div>
        <div className="text-2xl font-bold text-[var(--color-ink)]">{formatEther(stats.pool)} BOT</div>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Total Seed: {formatEther(stats.totalSeeded)} BOT
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Total Claims Paid: {formatEther(stats.totalClaims)} BOT
        </p>
      </div>
    </Card>
  );
}
