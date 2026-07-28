"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getProvider } from "@/lib/ethers";
import { formatBot } from "@/lib/format";
import { Coins } from "lucide-react";

export function BalanceCard({ account }: { account: string | null }) {
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!account) {
      setBalance(null);
      return;
    }
    (async () => {
      try {
        const provider = getProvider();
        const wei = await provider.getBalance(account);
        setBalance(wei);
      } catch {
        setBalance(null);
      }
    })();
  }, [account]);

  return (
    <Card className="relative overflow-hidden rounded-xl">
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success-soft)] text-[var(--color-success)]">
        <Coins size={18} />
      </div>
      <p className="text-sm font-medium text-[var(--color-muted)]">BOT balance</p>
      <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-[var(--color-ink)]">{balance !== null ? formatBot(balance) : "-"}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">BOT available</p>
    </Card>
  );
}
