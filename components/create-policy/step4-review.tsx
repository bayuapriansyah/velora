import { ACTION_LABELS } from "@/types/policy";
import { truncateAddress } from "@/lib/format";
import { PolicyFormState } from "./form-types";
import { parseEther } from "ethers";

function calcFee(amountBot: string, maxExec: number): { feeBot: number; costPerExecBot: number; requiredBudgetBot: number } {
  try {
    const FEE_BPS = 100n;
    const MIN_THRESHOLD_WEI = 100000000000000000n;
    const wei = parseEther(amountBot || "0");
    const feeWei = wei >= MIN_THRESHOLD_WEI ? (wei * FEE_BPS) / 10000n : 0n;
    const costPerExecWei = wei + feeWei;
    const totalWei = costPerExecWei * BigInt(maxExec);
    return {
      feeBot: Number(feeWei) / 1e18,
      costPerExecBot: Number(costPerExecWei) / 1e18,
      requiredBudgetBot: Number(totalWei) / 1e18,
    };
  } catch {
    return { feeBot: 0, costPerExecBot: 0, requiredBudgetBot: 0 };
  }
}

export function Step4Review({ form }: { form: PolicyFormState }) {
  const { feeBot, costPerExecBot, requiredBudgetBot } = calcFee(form.amountPerExecution, form.maxExecutions);

  const rows = [
    { label: "Name", value: form.name || "—" },
    { label: "Budget (deposit)", value: `${requiredBudgetBot} BOT` },
    { label: "Amount per execution", value: form.amountPerExecution ? `${form.amountPerExecution} BOT` : "—" },
    { label: "SafetyNet fee (1%)", value: `${feeBot} BOT` },
    { label: "Cost per execution", value: `${costPerExecBot} BOT` },
    { label: "Destination", value: form.destination ? truncateAddress(form.destination, 6) : "—" },
    { label: "Action", value: ACTION_LABELS[form.action] },
    { label: "Frequency", value: `Every ${form.paymentIntervalDays} days` },
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
