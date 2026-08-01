"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X, Save, RotateCcw, FileCode2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOT_CHAIN, botScanLink } from "@/lib/network";
import { getProvider } from "@/lib/ethers";
import {
  getConfiguredVeloraAddress,
  setConfiguredVeloraAddress,
  isValidContractAddress,
  resolveVeloraAddress,
} from "@/lib/velora-address";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => getConfiguredVeloraAddress() ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const trimmed = value.trim();
  const invalid = trimmed !== "" && !isValidContractAddress(trimmed);
  const configured = getConfiguredVeloraAddress();
  const activeAddress = resolveVeloraAddress(BOT_CHAIN.chainIdDecimal);

  const save = async () => {
    if (invalid || saving) return;
    setValidationError(null);

    if (trimmed) {
      setSaving(true);
      try {
        const provider = getProvider();
        const code = await provider.getCode(trimmed);
        if (code === "0x" || code === "0x0") {
          setValidationError(
            "No contract found at this address on the current network. Check the address or reset to the default contract."
          );
          setSaving(false);
          return;
        }
      } catch {
        // Wallet not connected — skip on-chain validation.
      } finally {
        setSaving(false);
      }
    }

    setConfiguredVeloraAddress(trimmed ? (trimmed as `0x${string}`) : null);
    setSaved(true);
    window.dispatchEvent(new Event("velora-settings-changed"));
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = () => {
    setValue("");
    setConfiguredVeloraAddress(null);
    setSaved(true);
    window.dispatchEvent(new Event("velora-settings-changed"));
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-[var(--color-velora-paper)] hover:text-[var(--color-velora-ink)] lg:py-3 lg:text-lg" style={{ color: '#9a9aa2' }}
        >
          <Settings size={18} strokeWidth={1.5} />
          Settings
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-6 shadow-[var(--shadow-card)] focus:outline-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                <Settings size={16} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#f5f5f5' }}>Settings</h2>
                <p className="text-[11px] text-[var(--color-muted)]">Application preferences</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close settings"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
              >
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>

          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div className="rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-4">
              <div className="flex items-center gap-2">
                <FileCode2 size={14} className="text-[var(--color-accent)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
                  Contract
                </p>
              </div>
              <p className="mt-2 text-sm text-[var(--color-ink)]">
                Velora contract address
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
                Optional. Leave empty to use the default deployed contract. Stored locally in your
                browser — it is public data, not a secret.
              </p>

              <input
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setValidationError(null);
                }}
                spellCheck={false}
                autoComplete="off"
                placeholder="0x… (empty = default contract)"
                className={cn(
                  "mt-3 w-full rounded-lg border bg-[var(--color-paper-2)] px-3 py-2.5 font-mono text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/60",
                  invalid || validationError
                    ? "border-[var(--color-danger)]/50 focus:border-[var(--color-danger)]"
                    : "border-[var(--color-rule)] focus:border-[var(--color-accent)]"
                )}
              />
              {invalid && (
                <p className="mt-1.5 text-xs text-[var(--color-danger)]">
                  Not a valid address — must be 0x followed by 40 hex characters.
                </p>
              )}
              {validationError && (
                <p className="mt-1.5 text-xs text-[var(--color-danger)]">{validationError}</p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2.5">
                <span className="text-xs text-[var(--color-muted)]">
                  {configured ? "Active (custom):" : "Active (default):"}
                </span>
                <a
                  href={botScanLink(`address/${activeAddress}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-mono text-xs text-[var(--color-accent)] hover:underline"
                >
                  {activeAddress}
                </a>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={invalid || saving}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    "bg-[var(--color-accent)] text-white hover:opacity-90"
                  )}
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saved ? (
                    <Check size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? "Checking…" : saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper-2)] px-3.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  Reset to default
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
