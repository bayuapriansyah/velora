import { ActionType, ACTION_LABELS } from "@/types/policy";
import { cn } from "@/lib/utils";
import { PolicyFormState } from "./form-types";

const actions = [ActionType.Transfer, ActionType.Swap, ActionType.ContractCall];

export function Step2Permissions({
  form,
  onChange,
}: {
  form: PolicyFormState;
  onChange: (patch: Partial<PolicyFormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Allowed destination</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">The only address this policy will ever release funds to.</p>
        <input
          value={form.destination}
          onChange={(e) => onChange({ destination: e.target.value })}
          placeholder="0x..."
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Allowed action</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">The only action type this policy will approve.</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ action: a })}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                form.action === a
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              {ACTION_LABELS[a]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
