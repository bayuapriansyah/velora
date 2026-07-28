"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/format";
import { RadioTower, Wallet } from "lucide-react";

export function WalletCard({ account, isCorrectNetwork }: { account: string | null; isCorrectNetwork: boolean }) {
  return (
    <Card className="relative overflow-hidden rounded-xl">
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
        <Wallet size={18} />
      </div>
      <p className="text-sm font-medium text-[var(--color-muted)]">Connected wallet</p>
      <p className="mt-3 font-mono text-xl font-semibold text-[var(--color-ink)]">{account ? truncateAddress(account, 6) : "Not connected"}</p>
      <div className="mt-4 flex items-center gap-2">
        <RadioTower size={15} className={isCorrectNetwork ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"} />
        <Badge tone={isCorrectNetwork ? "approved" : "rejected"}>
          {isCorrectNetwork ? "BOT Chain" : "Wrong network"}
        </Badge>
      </div>
    </Card>
  );
}
