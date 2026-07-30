"use client";

import Link from "next/link";
import {
  Plus,
  FlaskConical,
  RefreshCw,
  Wallet,
  RadioTower,
  ShieldCheck,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Activity,
} from "lucide-react";
import { formatBot, truncateAddress } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WalletHeroProps {
  account: string;
  balance: bigint | null;
  isCorrectNetwork: boolean;
  activePoliciesCount: number;
  totalPoliciesCount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function WalletHero({
  account,
  balance,
  isCorrectNetwork,
  activePoliciesCount,
  totalPoliciesCount,
  isLoading,
  onRefresh,
}: WalletHeroProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="col-span-12">
      <div className="flex h-full grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex">
          <div className="flex-1 relative overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[var(--color-accent)]/3 to-transparent" />
            <div className="relative p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                      Connected Wallet
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-sm">
                        <Wallet size={18} strokeWidth={1.5} />
                      </span>
                      <div>
                        <p className="text-xl font-semibold font-mono tracking-tight text-[var(--color-ink)]">
                          {truncateAddress(account, 6)}
                        </p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isCorrectNetwork ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"}`}
                            />
                            <span className="text-xs text-[var(--color-muted)]">
                              {isCorrectNetwork ? "BOT Chain" : "Wrong network"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                            <span className="text-xs text-[var(--color-muted)]">
                              {activePoliciesCount > 0
                                ? `${activePoliciesCount} active policy${activePoliciesCount > 1 ? "ies" : "y"}`
                                : "Contract ready"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
                    >
                      {copied ? (
                        <Check size={12} className="text-[var(--color-success)]" />
                      ) : (
                        <Copy size={12} />
                      )}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <a
                      href={`https://scan.bohr.life/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
                    >
                      <ExternalLink size={12} />
                      Explorer
                    </a>
                  </div>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                    Balance
                  </p>
                  <p className="mt-1 text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-[var(--color-ink)]">
                    {balance !== null ? formatBot(balance) : "—"}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-muted)]">BOT</p>
                  <div className="mt-3 flex items-center gap-3 sm:justify-end">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      <Activity size={12} />
                      <span>{totalPoliciesCount} policy{totalPoliciesCount !== 1 ? "ies" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                      <ShieldCheck size={12} />
                      <span>{activePoliciesCount} active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
              Quick Actions
            </p>
            <div className="mt-4 space-y-2.5">
              <Link href="/create-policy">
                <Button variant="primary" size="md" className="w-full justify-start gap-2.5">
                  <Plus size={16} />
                  Create Policy
                </Button>
              </Link>
              <Link href="/simulation">
                <Button variant="secondary" size="md" className="w-full mt-2.5 justify-start gap-2.5">
                  <FlaskConical size={16} />
                  Run Simulation
                </Button>
              </Link>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-start gap-2.5 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all duration-150 hover:bg-[var(--color-paper)] disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Sync Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
