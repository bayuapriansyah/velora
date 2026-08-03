"use client";

import { m } from "framer-motion";
import { User, Cpu, Database, ShieldCheck, LifeBuoy } from "lucide-react";

type Layer = {
  id: string;
  label: string;
  title: string;
  icon: typeof User;
  role: string;
  chips: string[];
  tag?: string;
  tone: "default" | "warn" | "accent";
};

const LAYERS: Layer[] = [
  {
    id: "L1",
    label: "Wallet Owner",
    title: "You",
    icon: User,
    role: "Your private key never leaves your wallet. You create the policy, sign every write, cancel, withdraw, and claim SafetyNet.",
    chips: ["MetaMask", "signs every tx"],
    tone: "default",
  },
  {
    id: "L2",
    label: "Autonomous Agent",
    title: "Request Only",
    icon: Cpu,
    role: "Holds a gas-only wallet. Scans due policies and calls executeRequest() — it can never move funds directly.",
    chips: ["gas-only wallet", "AI \u201cyes\u201d \u2260 approval"],
    tag: "NO WALLET ACCESS",
    tone: "warn",
  },
  {
    id: "L3",
    label: "Application Layer",
    title: "Next.js Frontend",
    icon: Database,
    role: "Reads policy state and on-chain events, submits signed transactions. Nothing about approve or reject is decided here.",
    chips: ["dashboard", "simulation", "agent panel"],
    tone: "default",
  },
  {
    id: "L4",
    label: "Protocol Layer",
    title: "Velora.sol",
    icon: ShieldCheck,
    role: "Immutable policy engine on BOT Chain. Holds the budget and enforces every rule in order — the single authority on approve and reject.",
    chips: ["BOT Chain · 677", "10 rules", "no owner key"],
    tag: "AUTHORITY",
    tone: "accent",
  },
  {
    id: "L5",
    label: "SafetyNet",
    title: "Compensation Pool",
    icon: LifeBuoy,
    role: "1% of every execution flows into a public pool. A policy can reclaim up to 70% of its contribution after a 30-second cooldown.",
    chips: ["fee 1%", "quota 70%", "cooldown 30s"],
    tone: "default",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Architecture() {
  return (
    <section className="px-6 py-20 md:py-32 border-y border-hairline bg-black/15 backdrop-blur-[3px]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 md:mb-16 max-w-2xl">
          <m.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase"
          >
            System Architecture
          </m.span>
          <m.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 md:mt-6 text-3xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            Five layers. One source of truth.
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 md:mt-6 text-base md:text-lg text-muted leading-relaxed"
          >
            Every layer exists to enforce one idea: the contract is the only
            authority. The frontend and the agent can request, but only
            Velora.sol decides.
          </m.p>
        </div>

        <div className="relative">
          {LAYERS.map(({ id, label, title, icon: Icon, role, chips, tag, tone }, i) => (
            <div key={id}>
              <m.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`relative flex gap-5 rounded-2xl p-6 md:p-8 border transition-colors duration-300 ${
                  tone === "accent"
                    ? "bg-surface border-accent/40 shadow-[0_0_50px_-12px_rgba(252,76,2,0.25)]"
                    : "bg-surface border-hairline hover:border-hairline/70"
                }`}
              >
                <div className="flex flex-col items-center shrink-0">
                  <span
                    className={`w-10 h-10 rounded-xl bg-base border font-mono text-xs flex items-center justify-center ${
                      tone === "accent"
                        ? "border-accent/40 text-accent"
                        : "border-hairline text-muted"
                    }`}
                  >
                    {id}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-widest text-muted">
                      {label}
                    </span>
                    {tag && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider border ${
                          tone === "accent"
                            ? "bg-accent/10 text-accent border-accent/25"
                            : "bg-rejected/10 text-rejected border-rejected/25"
                        }`}
                      >
                        {tag}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg md:text-xl font-medium text-ink flex items-center gap-2">
                    <Icon size={16} className={tone === "accent" ? "text-accent" : "text-muted"} />
                    {title}
                  </h3>
                  <p className="mt-2 text-sm md:text-[15px] text-muted leading-relaxed">{role}</p>
                  <div className="mt-3 md:mt-4 flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 rounded-md bg-base border border-hairline font-mono text-[10px] text-muted"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </m.div>

              {i < LAYERS.length - 1 && (
                <div className="ml-[20px] h-5 w-px bg-hairline" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
