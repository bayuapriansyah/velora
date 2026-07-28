import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Information", "Permissions", "Limits", "Review"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isDone && "bg-[var(--color-accent)] text-white",
                  isCurrent && "bg-[var(--color-accent-soft)] text-[var(--color-accent)] ring-2 ring-[var(--color-accent)]",
                  !isDone && !isCurrent && "bg-[var(--color-paper)] text-[var(--color-muted)] border border-[var(--color-rule)]"
                )}
              >
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              <span className={cn("text-xs font-medium", isCurrent ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]")}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("mx-3 h-px flex-1 transition-colors", isDone ? "bg-[var(--color-accent)]" : "bg-[var(--color-rule)]")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
