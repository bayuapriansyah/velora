"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export type RuleState = "pending" | "checking" | "passed" | "failed";

export interface TimelineRule {
  label: string;
  state: RuleState;
}

export function ValidationTimeline({ rules, isIdle }: { rules: TimelineRule[]; isIdle: boolean }) {
  return (
    <Card>
      <p className="mb-5 text-sm font-medium text-[var(--color-muted)]">Validation, rule by rule</p>
      {isIdle ? (
        <p className="text-sm text-[var(--color-muted)]">Build a request and run the simulation to see the contract check each rule live.</p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {rules.map((r) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                  r.state === "passed"
                    ? "border-[var(--color-success)]/20 bg-[var(--color-success-soft)]"
                    : r.state === "failed"
                    ? "border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)]"
                    : "border-[var(--color-rule)] bg-[var(--color-paper)]"
                }`}
              >
                <span
                  className={`text-sm ${
                    r.state === "passed" ? "text-[var(--color-success)]" : r.state === "failed" ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]"
                  }`}
                >
                  {r.label}
                </span>
                {r.state === "checking" && <Loader2 size={16} className="animate-spin text-[var(--color-muted)]" />}
                {r.state === "passed" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                {r.state === "failed" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-white">
                    <X size={12} strokeWidth={3} />
                  </span>
                )}
                {r.state === "pending" && <span className="h-5 w-5 rounded-full border border-[var(--color-rule)]" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
