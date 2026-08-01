"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  TestTubeDiagonal,
  Shield,
  LogOut,
  RadioTower,
  Copy,
  Check,
  Menu,
  X,
  FileText,
  Bot,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsDialog } from "@/components/dashboard/settings-dialog";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/policies", label: "Policies", icon: FileText },
  { href: "/create-policy", label: "Create Policy", icon: Plus },
  { href: "/simulation", label: "Simulation", icon: TestTubeDiagonal },
  { href: "/agent", label: "Agent", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  const { account, isCorrectNetwork, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) => pathname === href;

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col mx-3">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-velora-rule)] px-6">
        <a href="/">
          <img src="/velora.png" alt="Velora Logo" className="h-10 w-10 rounded-lg shadow-sm scale-[1.5]" />
        </a>
        <div>
          <span className="text-base font-semibold text-xl tracking-tight text-white">Velora</span>
          <p className="text-[10px] leading-tight text-[var(--color-velora-muted)]">Security Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-3">
          {links.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[#f5f5f5] font-medium transition-all duration-150 lg:py-3 lg:text-lg",
                  active
                    ? "bg-[var(--color-velora-accent-soft)] text-[var(--color-velora-accent)]"
                    : "text-[var(--color-velora-muted)] hover:bg-[var(--color-velora-paper)] hover:text-[var(--color-velora-ink)]"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-velora-accent)]" />
                )}
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-3 border-t border-[var(--color-velora-rule)] pt-3">
          <SettingsDialog />
        </div>
      </nav>

      <div className="border-t border-[var(--color-velora-rule)] p-4">
        <div className="rounded-xl border border-[var(--color-velora-rule)] bg-[var(--color-velora-paper)] p-3.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-md bg-[var(--color-velora-accent-soft)] p-1">
                  <Shield size={10} className="text-[var(--color-velora-accent)]" />
                </span>
                <p className="text-[11px] font-medium text-[var(--color-velora-muted)]">Wallet</p>
              </div>
              <p className="mt-1 truncate font-mono text-sm font-semibold text-[var(--color-velora-ink)]">
                {account ? truncateAddress(account, 4) : "Not connected"}
              </p>
            </div>
            {account && (
              <div className="flex gap-1">
                <button
                  onClick={copyAddress}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-velora-muted)] transition-colors hover:bg-[var(--color-velora-surface)] hover:text-[var(--color-velora-ink)]"
                  title="Copy address"
                >
                  {copied ? <Check size={12} className="text-[var(--color-velora-success)]" /> : <Copy size={12} />}
                </button>
                <button
                  onClick={disconnect}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-velora-muted)] transition-colors hover:bg-[var(--color-velora-danger-soft)] hover:text-[var(--color-velora-danger)]"
                  title="Disconnect"
                >
                  <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--color-velora-rule)] pt-2.5 text-xs text-[var(--color-velora-muted)]">
            <RadioTower
              size={12}
              className={isCorrectNetwork ? "text-[var(--color-velora-success)]" : "text-[var(--color-velora-danger)]"}
            />
            <span className="font-medium">{isCorrectNetwork ? "BOT Chain" : "Wrong network"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-3.5 z-50 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-velora-rule)] bg-[var(--color-velora-surface)] text-[var(--color-velora-ink)] shadow-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={16} />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-[var(--color-velora-rule)] bg-[var(--color-velora-surface)] shadow-[var(--shadow-sidebar)] transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-velora-rule)] px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-[var(--color-velora-ink)]">Menu</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-velora-muted)] hover:bg-[var(--color-velora-paper)]"
        >
          <X size={16} />
        </button>
      </div>
      {sidebarContent}
    </aside>
  </>
);
}
