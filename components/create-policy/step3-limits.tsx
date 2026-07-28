import { PolicyFormState } from "./form-types";

const expirationPresets = [
  { label: "1 hour", hours: 1 },
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
];

export function Step3Limits({
  form,
  onChange,
}: {
  form: PolicyFormState;
  onChange: (patch: Partial<PolicyFormState>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Expiration</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">The policy stops approving requests after this window.</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {expirationPresets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange({ expirationHours: p.hours })}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                form.expirationHours === p.hours
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Maximum executions</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">How many times this policy can be used before it&apos;s exhausted.</p>
        <input
          type="number"
          min="1"
          step="1"
          value={form.maxExecutions}
          onChange={(e) => onChange({ maxExecutions: Math.max(1, parseInt(e.target.value || "1", 10)) })}
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}
