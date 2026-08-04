"use client";

import { m } from "framer-motion";
import {
  FileText,
  Wallet,
  Zap,
  Coins,
  Repeat,
  Hash,
  CalendarClock,
  ShieldCheck,
  Ban,
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
  { icon: FileText, label: "Name", desc: "A label so you can recognize it later." },
  { icon: Wallet, label: "Allowed destination", desc: "The only address funds can ever go to." },
  { icon: Zap, label: "Action", desc: "What the policy may do. Currently: Send BOT." },
  { icon: Coins, label: "Budget", desc: "Total BOT deposited and locked in the contract." },
  { icon: Repeat, label: "Amount per execution", desc: "Exact BOT sent per approved request." },
  { icon: CalendarClock, label: "Payment interval", desc: "Minimum time between two payments, e.g. every 24h." },
  { icon: Hash, label: "Max executions", desc: "How many times the policy can pay in total." },
  { icon: ShieldCheck, label: "Expiration", desc: "When the policy stops being active." },
];

const example = [
  { k: "Destination", v: "0x9b4\u20261a8c", note: "AI API merchant" },
  { k: "Action", v: "Send BOT", accent: true },
  { k: "Budget", v: "240 BOT" },
  { k: "Amount per execution", v: "20 BOT" },
  { k: "Interval", v: "Every 30 days" },
  { k: "Max executions", v: "12" },
  { k: "Expires", v: "In 6 months" },
];

function ExampleRow({ k, v, note, accent }: { k: string; v: string; note?: string; accent?: boolean }) {
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

export function PolicyFields() {
  return (
    <section className="relative isolate px-6 py-20 md:py-32 overflow-hidden border-t border-hairline">
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[1000px] h-[300px] md:h-[500px] bg-rejected/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-7xl">
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
            What a policy can express.
          </m.h2>
          <m.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-4 md:mt-6 text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed"
          >
            Velora doesn&rsquo;t just lock your funds &mdash; it expresses exactly how they can be
            spent. Every policy is a set of plain, on-chain-enforced fields.
          </m.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* Left: the fields */}
          <m.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-[24px] md:rounded-[32px] bg-surface border border-hairline p-6 md:p-10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-base border border-hairline text-accent">
                <ShieldCheck size={16} />
              </span>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-ink">Fields you control</h3>
                <p className="text-xs text-muted mt-0.5">8 knobs &mdash; everything the contract can enforce.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {fields.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base border border-hairline text-accent">
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-base border border-hairline px-4 py-3 text-xs text-muted leading-relaxed">
              Executions above a small threshold pay a 1% SafetyNet fee into a shared pool.
            </div>
          </m.div>

          {/* Right: the example */}
          <m.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col rounded-[24px] md:rounded-[32px] bg-base border border-hairline p-6 md:p-10 shadow-[0_0_50px_-12px_rgba(254,77,71,0.30)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-hairline text-accent">
                  <Zap size={16} />
                </span>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-ink">AI API credits</h3>
                  <p className="text-[11px] text-muted font-mono">policy #42</p>
                </div>
              </div>
              <span className="rounded-full bg-approved/10 text-approved text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-approved/20">
                Active
              </span>
            </div>

            <div className="font-mono text-[11px] md:text-xs leading-6 space-y-2">
              {example.map((f) => (
                <ExampleRow key={f.k} k={f.k} v={f.v} note={f.note} accent={f.accent} />
              ))}
            </div>

            <p className="mt-6 text-sm md:text-base text-muted leading-relaxed">
              The agent can send exactly <span className="text-ink font-medium">20 BOT</span> to that
              merchant for AI API credits, at most once a month, 12 times, and only from the locked
              240 BOT &mdash; never anywhere else.
            </p>

            <div className="mt-6 rounded-xl border border-rejected/20 bg-rejected/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rejected mb-1.5">
                <Ban size={13} /> What it cannot do
              </div>
              <p className="text-xs md:text-sm text-muted leading-relaxed">
                Touch your other funds &middot; change the destination &middot; change the amount
                &middot; outrun the schedule. Anything outside these fields is rejected on-chain.
              </p>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
