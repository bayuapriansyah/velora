"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { WalletButton } from "./wallet-button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create-policy", label: "Create Policy" },
  { href: "/simulation", label: "Simulation" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-rule)] bg-[var(--color-paper)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-[var(--color-ink)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
            <Shield size={16} strokeWidth={2} />
          </span>
          Velora
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname === l.href
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
