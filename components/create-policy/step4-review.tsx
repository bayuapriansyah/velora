import { ACTION_LABELS } from "@/types/policy";
import { truncateAddress } from "@/lib/format";
import { PolicyFormState } from "./form-types";

export function Step4Review({ form }: { form: PolicyFormState }) {
  const rows = [
    { label: "Name", value: form.name || "—" },
    { label: "Budget", value: form.budget ? `${form.budget} BOT` : "—" },
    { label: "Destination", value: form.destination ? truncateAddress(form.destination, 6) : "—" },
    { label: "Action", value: ACTION_LABELS[form.action] },
    { label: "Expiration", value: `${form.expirationHours} hours from deployment` },
    { label: "Max executions", value: String(form.maxExecutions) },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--color-muted)]">
        Review the policy below. Once deployed, it&apos;s immutable — you can cancel and withdraw, but not edit.
      </p>
      <div className="divide-y divide-[var(--color-rule)] rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-[var(--color-muted)]">{r.label}</span>
            <span className="font-medium text-[var(--color-ink)]">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        Deploying signs one transaction that creates the policy and deposits its budget atomically — one gas fee,
        no intermediate zero-budget state.
      </p>
    </div>
  );
}
