import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-[var(--color-paper)] text-[var(--color-muted)] border border-[var(--color-rule)]",
      accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      approved: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
      rejected: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
