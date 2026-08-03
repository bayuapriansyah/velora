"use client";

import { m } from "framer-motion";
import {
  Cpu,
  Lock,
  Server,
  Globe,
  Boxes,
  HardDrive,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fields = [
  { k: "Recipient wallet", v: "0x9b4…1a8c", note: "AI API merchant" },
  { k: "Allowed action", v: "Send BOT", accent: true },
  { k: "Token", v: "BOT" },
  { k: "Max payment / execution", v: "20 BOT" },
  { k: "Payment frequency", v: "Every 30 days" },
  { k: "Max executions", v: "12" },
  { k: "Expiration", v: "6 months" },
  { k: "Budget locked", v: "240 BOT", accent: true },
];

const useCases = [
  { icon: Cpu, label: "AI API Credits", note: "20 BOT / mo" },
  { icon: Lock, label: "VPN Subscription", note: "3 BOT / mo" },
  { icon: Server, label: "Cloud Server (VPS)", note: "15 BOT / mo" },
  { icon: Globe, label: "Domain Renewal", note: "2 BOT / yr" },
  { icon: Boxes, label: "Web Hosting", note: "8 BOT / mo" },
  { icon: HardDrive, label: "Storage Subscription", note: "5 BOT / mo" },
];

const pipeline = [
  {
    icon: FileText,
    step: "You describe it",
    desc: "\u201CPay the AI API merchant 20 BOT every month for agent credits.\u201D",
  },
  {
    icon: Cpu,
    step: "AI structures it",
    desc: "Velora turns your words into policy fields \u2014 wallet, amount, frequency, expiry.",
  },
  {
    icon: ShieldCheck,
    step: "Contract enforces it",
    desc: "Velora.sol verifies every request against those rules and pays on-chain.",
  },
];

function Row({ k, v, note, accent }: { k: string; v: string; note?: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{k}</span>
      <span className="text-right">
        <span className={accent ? "text-accent" : "text-ink/90"}>{v}</span>
        {note && <span className="ml-2 text-[10px] text-muted">{note}</span>}
      </span>
    </div>
  );
}

export function PolicyExample() {
  return (
    <section className="relative isolate px-6 py-20 md:py-32 overflow-hidden border-t border-hairline">
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[1000px] h-[300px] md:h-[500px] bg-accent/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <m.span
            variants={fadeUp}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase"
          >
            Concrete example
          </m.span>
          <m.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 md:mt-6 text-3xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            What a policy can actually express.
          </m.h2>
          <m.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 md:mt-6 text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed"
          >
            Every policy is a set of plain fields enforced on-chain. Here is what
            one looks like for a real, recurring payment in BOT.
          </m.p>
        </div>

        {/* Main example card */}
        <m.div
          variants={fadeUp}
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 overflow-hidden rounded-[24px] md:rounded-[32px] bg-surface border border-hairline shadow-2xl"
        >
          {/* Left: natural language → structured policy */}
          <div className="relative p-6 md:p-10 flex flex-col justify-center">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

            <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-base border border-hairline px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
              <FileText size={11} className="text-accent" /> You say
            </span>
            <blockquote className="relative mt-4 rounded-2xl bg-base border border-hairline p-5 md:p-6 text-base md:text-lg font-medium text-ink leading-relaxed">
              &ldquo;Pay the AI API merchant 20 BOT every month for agent credits.&rdquo;
            </blockquote>

            <div className="relative mt-5 flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                Velora compiles it
              </span>
              <ArrowRight size={14} className="text-accent/60" />
            </div>

            <p className="relative mt-2 text-sm md:text-base text-muted leading-relaxed max-w-md">
              An AI maps your sentence into a structured policy. The smart contract
              then verifies every request against those fields &mdash; and only those fields.
            </p>
          </div>

          {/* Right: the policy card */}
          <div className="relative border-t lg:border-t-0 lg:border-l border-hairline bg-base p-6 md:p-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-hairline text-accent">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-ink">AI API Credits</h3>
                  <p className="text-[11px] text-muted font-mono">policy #1</p>
                </div>
              </div>
              <span className="rounded-full bg-approved/10 text-approved text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-approved/20">
                Active
              </span>
            </div>

            <div className="font-mono text-[11px] md:text-xs leading-6 space-y-2">
              {fields.map((f) => (
                <Row key={f.k} k={f.k} v={f.v} note={f.note} accent={f.accent} />
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-surface border border-hairline p-4 text-xs md:text-sm text-muted leading-relaxed">
              The contract pays the merchant exactly 20 BOT, at most once every 30
              days, up to 12 times &mdash; only from the 240 BOT locked in.
            </div>
          </div>
        </m.div>

        {/* Use cases */}
        <m.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
        >
          {useCases.map(({ icon: Icon, label, note }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl bg-surface border border-hairline p-4 md:p-5 transition-colors duration-300 hover:border-hairline/70"
            >
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-accent/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-base border border-hairline text-accent">
                <Icon size={14} />
              </span>
              <p className="relative mt-3 text-xs md:text-sm font-medium text-ink leading-snug">
                {label}
              </p>
              <p className="relative mt-1 text-[10px] md:text-[11px] font-mono text-muted">{note}</p>
            </div>
          ))}
        </m.div>

        {/* Pipeline */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 md:gap-5">
          {pipeline.map(({ icon: Icon, step, desc }, i) => (
            <m.div
              key={step}
              variants={fadeUp}
              custom={5 + i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative rounded-2xl bg-surface border border-hairline p-5 md:p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-base border border-hairline text-accent">
                  <Icon size={14} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-sm md:text-base font-medium text-ink">{step}</h3>
              <p className="mt-1.5 text-xs md:text-sm text-muted leading-relaxed">{desc}</p>
            </m.div>
          ))}
        </div>

        {/* Cannot-do note */}
        <m.p
          variants={fadeUp}
          custom={8}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-8 text-center text-xs md:text-sm text-muted max-w-2xl mx-auto leading-relaxed"
        >
          It cannot touch your other funds, send to any other address, change the
          amount, or outrun the schedule &mdash; the contract rejects anything outside the
          fields above.
        </m.p>
      </div>
    </section>
  );
}
