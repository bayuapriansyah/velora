"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { parseEther } from "ethers";
import { Check, Copy, Fuel, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSigner } from "@/lib/ethers";
import { truncateAddress } from "@/lib/format";

interface FundAgentDialogProps {
  address: string | null;
  onFunded: () => void;
}

export function FundAgentDialog({ address, onFunded }: FundAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0.002");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  let parsed: bigint | null = null;
  if (/^\d+(\.\d+)?$/.test(amount.trim())) {
    try {
      parsed = parseEther(amount.trim());
    } catch {
      parsed = null;
    }
  }
  const invalid = parsed === null || parsed <= 0n;

  const fund = async () => {
    if (!address || invalid || parsed === null || sending) return;
    setSending(true);
    setError(null);
    setDone(false);
    try {
      const signer = await getSigner();
      const tx = await signer.sendTransaction({ to: address, value: parsed });
      await tx.wait();
      setDone(true);
      onFunded();
    } catch (e: any) {
      setError(
        e?.message || "Funding failed. Make sure your wallet is connected on BOT Chain."
      );
    } finally {
      setSending(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={!address}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Fuel size={12} className="text-[var(--color-accent)]" />
          Fund gas
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-[var(--shadow-card)] focus:outline-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Fuel size={16} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Fund agent gas</h2>
                <p className="text-[11px] text-[var(--color-muted)]">Send BOT from your wallet</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close fund dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
              >
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-4">
            <p className="text-xs text-[var(--color-muted)]">Agent wallet</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <p className="truncate font-mono text-sm font-semibold text-[var(--color-ink)]">
                {address ? truncateAddress(address, 6) : "—"}
              </p>
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex shrink-0 items-center gap-1 rounded-md text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                title="Copy address"
              >
                {copied ? (
                  <Check size={13} className="text-[var(--color-success)]" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
              Sends BOT from your connected wallet so the agent can pay for execution gas. You
              sign this transaction yourself — the agent key never leaves the server.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  inputMode="decimal"
                  spellCheck={false}
                  aria-label="Amount of BOT to send"
                  className={cn(
                    "w-full rounded-lg border bg-[var(--color-paper-2)] px-2.5 py-2 pr-9 font-mono text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/60",
                    invalid || error
                      ? "border-[var(--color-danger)]/50 focus:border-[var(--color-danger)]"
                      : "border-[var(--color-rule)] focus:border-[var(--color-accent)]"
                  )}
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">
                  BOT
                </span>
              </div>
              <button
                type="button"
                onClick={fund}
                disabled={sending || invalid || !address}
                className="inline-flex h-[38px] items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Fuel size={14} />
                )}
                {sending ? "Sending…" : done ? "Sent" : "Fund"}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{error}</p>}
            {done && !error && (
              <p className="mt-1.5 text-xs text-[var(--color-success)]">
                BOT sent — agent balance refreshed.
              </p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
