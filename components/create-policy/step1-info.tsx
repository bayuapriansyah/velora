import { PolicyFormState } from "./form-types";

export function Step1Info({
  form,
  onChange,
}: {
  form: PolicyFormState;
  onChange: (patch: Partial<PolicyFormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Policy name</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">What is this policy for? Shown on your dashboard.</p>
        <input
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Purchase API Credits"
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Budget (BOT)</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Deposited immediately and locked in the contract as this policy&apos;s spending cap.</p>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={form.budget}
          onChange={(e) => onChange({ budget: e.target.value })}
          placeholder="10"
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}
