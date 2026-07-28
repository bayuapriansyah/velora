"use client";

import { Bot, Zap, AlertOctagon, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionType, Policy, PolicyStatus, ACTION_LABELS } from "@/types/policy";
import { formatBot, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

const ALL_ACTIONS = [ActionType.Transfer, ActionType.Swap, ActionType.ContractCall];

interface RequestBuilderProps {
  policies: Policy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  selectedAction: ActionType;
  onActionChange: (a: ActionType) => void;
  onRunValid: () => void;
  onRunInvalid: () => void;
  onRunWrongAction: () => void;
  isRunning: boolean;
}

export function RequestBuilder({
  policies,
  selectedId,
  onSelect,
  amount,
  onAmountChange,
  selectedAction,
  onActionChange,
  onRunValid,
  onRunInvalid,
  onRunWrongAction,
  isRunning,
}: RequestBuilderProps) {
  const activePolicies = policies.filter((p) => p.status === PolicyStatus.Active);
  const selected = activePolicies.find((p) => p.id.toString() === selectedId) ?? null;

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Bot size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Agent request emulator</p>
          <p className="text-xs text-[var(--color-muted)]">Simulation — sends a real transaction to Velora.sol</p>
        </div>
      </div>

      {activePolicies.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">You need an active policy to simulate a request.</p>
      ) : (
        <>
          <label className="text-sm font-medium text-[var(--color-ink)]">Policy</label>
          <div className="mt-2 space-y-2">
            {activePolicies.map((p) => (
              <button
                key={p.id.toString()}
                onClick={() => onSelect(p.id.toString())}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  selectedId === p.id.toString()
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                    : "border-[var(--color-rule)] bg-[var(--color-paper-2)] hover:bg-[var(--color-paper)]"
                )}
              >
                <p className="text-sm font-medium text-[var(--color-ink)]">{p.name || `Policy #${p.id}`}</p>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {ACTION_LABELS[p.allowedAction]} → {truncateAddress(p.allowedDestination)} ·{" "}
                  {formatBot(p.remainingBudget)} BOT remaining
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <>
              <label className="mt-5 block text-sm font-medium text-[var(--color-ink)]">Amount (BOT)</label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
              />

              <label className="mt-5 block text-sm font-medium text-[var(--color-ink)]">Action to request</label>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Policy allows only <span className="font-medium text-[var(--color-ink)]">{ACTION_LABELS[selected.allowedAction]}</span>.
                Pick a different one to see the contract reject it.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ALL_ACTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onActionChange(a)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      selectedAction === a
                        ? a === selected.allowedAction
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          : "border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                        : "border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    )}
                  >
                    {ACTION_LABELS[a]}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button onClick={onRunValid} disabled={isRunning}>
                  <Zap size={16} />
                  Simulate AI request
                </Button>
                <Button variant="secondary" onClick={onRunInvalid} disabled={isRunning}>
                  <AlertOctagon size={16} />
                  Simulate invalid request
                </Button>
              </div>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={onRunWrongAction}
                disabled={isRunning}
              >
                <ShieldAlert size={16} />
                Simulate wrong action
              </Button>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                &ldquo;Simulate AI request&rdquo; sends the amount above using the action selected. &ldquo;Simulate invalid request&rdquo;
                deliberately overspends the remaining budget. &ldquo;Simulate wrong action&rdquo; deliberately requests an
                action type the policy doesn&apos;t allow, to show an ActionMismatch rejection.
              </p>
            </>
          )}
        </>
      )}
    </Card>
  );
}
