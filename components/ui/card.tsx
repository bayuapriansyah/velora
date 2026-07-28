import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-[var(--color-paper-2)] border border-[var(--color-rule)] shadow-[var(--shadow-card)] p-6", className)}
      {...props}
    />
  );
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn("hover-lift", className)} {...props} />;
}
