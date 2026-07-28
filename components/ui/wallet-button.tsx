"use client";

import { Wallet, AlertTriangle, LogOut } from "lucide-react";
import { Button } from "./button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/format";

export function WalletButton() {
  const { account, isConnecting, isCorrectNetwork, connect, disconnect } = useWallet();

  if (account && !isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" onClick={connect}>
          <AlertTriangle size={16} />
          Wrong network
        </Button>
        <button
          onClick={disconnect}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-danger)]/20 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
          title="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-3.5 h-9 text-sm font-medium text-[var(--color-ink)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
          {truncateAddress(account)}
        </span>
        <button
          onClick={disconnect}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-danger)]/20 hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
          title="Disconnect wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={connect} disabled={isConnecting}>
      <Wallet size={16} />
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
