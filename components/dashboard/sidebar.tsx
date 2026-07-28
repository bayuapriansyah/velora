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
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create-policy", label: "Create Policy", icon: Plus },
  { href: "/simulation", label: "Simulation", icon: TestTubeDiagonal },
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
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--color-rule)] px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-sm">
          <Shield size={17} strokeWidth={2} />
        </span>
        <div>
          <span className="text-base font-semibold tracking-tight text-[var(--color-ink)]">Velora</span>
          <p className="text-[10px] leading-tight text-[var(--color-muted)]">Security Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-0.5">
          {links.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--color-accent)]" />
                )}
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--color-rule)] p-4">
        <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-3.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-md bg-[var(--color-accent-soft)] p-1">
                  <Shield size={10} className="text-[var(--color-accent)]" />
                </span>
                <p className="text-[11px] font-medium text-[var(--color-muted)]">Wallet</p>
              </div>
              <p className="mt-1 truncate font-mono text-sm font-semibold text-[var(--color-ink)]">
                {account ? truncateAddress(account, 4) : "Not connected"}
              </p>
            </div>
            {account && (
              <div className="flex gap-1">
                <button
                  onClick={copyAddress}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
                  title="Copy address"
                >
                  {copied ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
                </button>
                <button
                  onClick={disconnect}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                  title="Disconnect"
                >
                  <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2 border-t border-[var(--color-rule)] pt-2.5 text-xs text-[var(--color-muted)]">
            <RadioTower
              size={12}
              className={isCorrectNetwork ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}
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
        className="fixed left-4 top-3.5 z-50 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink)] shadow-sm lg:hidden"
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
          "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-[var(--shadow-sidebar)] transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] px-4 py-3 lg:hidden">
          <span className="text-sm font-semibold text-[var(--color-ink)]">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-paper)]"
          >
            <X size={16} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
