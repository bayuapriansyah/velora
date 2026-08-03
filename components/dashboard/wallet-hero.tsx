"use client";

import { Wallet, Copy, Check, ExternalLink, FileCode2 } from "lucide-react";
import { formatBot, truncateAddress } from "@/lib/format";
import { BOT_CHAIN, botScanLink } from "@/lib/network";
import { resolveVeloraAddress } from "@/lib/velora-address";
import { useState } from "react";

interface WalletHeroProps {
  account: string;
  balance: bigint | null;
  isCorrectNetwork: boolean;
}

export function WalletHero({ account, balance, isCorrectNetwork }: WalletHeroProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const contractAddress = resolveVeloraAddress(BOT_CHAIN.chainIdDecimal);

  return (
    <div className="col-span-12 lg:col-span-8 flex">
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] shadow-sm">
        {/* Layered premium background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-[90px]" />
          <div className="absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-[var(--color-bg-crimson-glow)] blur-[70px]" />
        </div>
        <div className="velora-noise pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay" />

        <div className="relative flex flex-1 flex-col p-6">
          {/* Identity bar */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-sm">
                <Wallet size={18} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
                  Connected Wallet
                </p>
                <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                  {truncateAddress(account, 6)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  isCorrectNetwork
                    ? "border-[var(--color-success)]/30 bg-[var(--color-success-soft)] text-[var(--color-success)]"
                    : "border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isCorrectNetwork ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"}`}
                />
                BOT Chain · 677
              </span>
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
              >
                {copied ? (
                  <Check size={12} className="text-[var(--color-success)]" />
                ) : (
                  <Copy size={12} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={botScanLink(`address/${account}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
              >
                <ExternalLink size={12} />
                Explorer
              </a>
            </div>
          </div>

          {/* Balance hero */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-muted)] uppercase">
              Available Balance
            </p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-6xl font-semibold tabular-nums tracking-tight text-[var(--color-ink)] sm:text-7xl">
                {balance !== null ? formatBot(balance) : "—"}
              </p>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">BOT</p>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-rule)] pt-3 text-[11px] text-[var(--color-muted)]">
            {contractAddress ? (
              <a
                href={botScanLink(`address/${contractAddress}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--color-ink)]"
              >
                <FileCode2 size={12} className="text-[var(--color-accent)]" />
                Contract Verified
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <FileCode2 size={12} className="text-[var(--color-accent)]" />
                Contract
              </span>
            )}
            <span>Zero-trust execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
