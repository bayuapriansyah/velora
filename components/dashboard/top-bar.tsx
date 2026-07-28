"use client";

import { Search, Bell } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";

interface TopBarProps {
  title?: string;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/create-policy": "Create Policy",
  "/simulation": "Simulation",
};

export function TopBar({ title }: TopBarProps) {
  const { account } = useWallet();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-rule)] bg-[var(--color-paper-2)] px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-[var(--color-ink)]">{title || "Dashboard"}</h1>
        <span className="rounded-full border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-muted)]">
          Beta
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-8 w-52 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] pl-9 pr-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
          />
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]">
          <Bell size={16} strokeWidth={1.5} />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white ring-2 ring-[var(--color-paper-2)] shadow-sm">
          {account ? truncateAddress(account, 2).slice(2, 4) : "V"}
        </div>
      </div>
    </header>
  );
}
