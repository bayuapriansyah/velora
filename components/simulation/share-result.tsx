"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBot } from "@/lib/format";
import { SimulationResult } from "./result-panel";
import { REJECT_REASON_LABELS } from "@/types/policy";

export function ShareResult({ result, policyName }: { result: SimulationResult; policyName: string }) {
  const [copied, setCopied] = useState(false);

  const text = result.approved
    ? `Just watched an AI agent request ${formatBot(result.amountWei)} BOT on "${policyName}" — Velora's smart contract approved it on-chain in real time. Delegate tasks, not your wallet. #BOTChain #Velora`
    : `Tried to make an AI agent overspend on "${policyName}" — Velora's smart contract rejected it on-chain: ${
        result.reason !== undefined ? REJECT_REASON_LABELS[result.reason] : "policy violation"
      }. The contract decides, not the agent. #BOTChain #Velora`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-5">
      <p className="text-sm font-medium text-[var(--color-ink)]">Share this result</p>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{text}</p>
      <div className="mt-4 flex gap-2">
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm">
            <Share2 size={14} />
            Share on X
          </Button>
        </a>
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy text"}
        </Button>
      </div>
    </div>
  );
}
