"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RejectReason, REJECT_REASON_LABELS } from "@/types/policy";
import { formatBot } from "@/lib/format";

export interface SimulationResult {
  approved: boolean;
  reason?: RejectReason;
  aiReason?: string;
  amountWei: bigint;
  remainingBudgetWei?: bigint;
  txHash: string;
}

export function ResultPanel({ result }: { result: SimulationResult | null }) {
  if (!result) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={result.approved ? "border-[var(--color-success)]/20 bg-[var(--color-success-soft)]" : "border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)]"}>
        <div className="flex items-center gap-3">
          {result.approved ? (
            <CheckCircle2 size={28} className="text-[var(--color-success)]" />
          ) : (
            <XCircle size={28} className="text-[var(--color-danger)]" />
          )}
          <div>
            <p className={`text-lg font-semibold ${result.approved ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {result.approved ? "Approved" : "Rejected"}
            </p>
            {result.approved ? (
              <p className="text-sm text-[var(--color-ink)]">
                {formatBot(result.amountWei)} BOT sent
                {result.remainingBudgetWei !== undefined && ` · ${formatBot(result.remainingBudgetWei)} BOT remaining`}
              </p>
            ) : (
              <p className="text-sm text-[var(--color-ink)]">
                Reason: {result.aiReason ? result.aiReason : (result.reason !== undefined ? REJECT_REASON_LABELS[result.reason] : "Unknown")}
              </p>
            )}
          </div>
        </div>
        {result.txHash && result.txHash !== "AI_SIMULATION" && (
          <a
            href={`https://scan.bohr.life/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            title="View on the BOT Chain explorer"
          >
            {result.txHash.slice(0, 10)}…{result.txHash.slice(-6)}
            <ExternalLink size={12} />
          </a>
        )}
      </Card>
    </motion.div>
  );
}
