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
        <label className="text-sm font-medium text-[var(--color-ink)]">Amount per execution (BOT)</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">How much BOT to send/use per execution.</p>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={form.amountPerExecution}
          onChange={(e) => onChange({ amountPerExecution: e.target.value })}
          placeholder="0.02"
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-ink)]">Payment frequency (Days)</label>
        <p className="mt-1 text-sm text-[var(--color-muted)]">How often the agent should execute this policy (1 = Daily, 7 = Weekly, 30 = Monthly).</p>
        <input
          type="number"
          min="1"
          step="1"
          value={form.paymentIntervalDays}
          onChange={(e) => onChange({ paymentIntervalDays: Math.max(1, parseInt(e.target.value || "1", 10)) })}
          placeholder="30"
          className="mt-2 w-full rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 py-3 text-sm font-mono text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-accent)]"
        />
        <label className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)] cursor-pointer">
          <input
            type="checkbox"
            checked={form.useSeconds}
            onChange={(e) => onChange({ useSeconds: e.target.checked })}
            className="rounded border-[var(--color-rule)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          Use seconds (Demo Mode)
        </label>
        {form.useSeconds && (
          <p className="mt-1 text-xs text-[var(--color-danger)] font-medium">
            ⚠️ Warning: Demo mode uses seconds. Only for testing purposes!
          </p>
        )}
      </div>
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
