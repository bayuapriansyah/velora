"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ShieldCheck, Key, Wallet, LifeBuoy } from "lucide-react";

type Feature = {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  chips: string[];
};

const FEATURES: Feature[] = [
  {
    icon: Key,
    title: "Zero-Trust Agent Access",
    desc: "Agents hold a gas-only wallet and can only request executions. Even an AI \"yes\" can still be rejected by the contract on-chain.",
    chips: ["agent → request only", "contract decides"],
  },
  {
    icon: Wallet,
    title: "Budget Isolation",
    desc: "createPolicy deposits (amountPerExecution + fee) × maxExecutions in a single atomic transaction. The agent can never touch your main wallet.",
    chips: ["deposit = (amt + 1%) × max", "one tx"],
  },
  {
    icon: LifeBuoy,
    title: "SafetyNet Compensation",
    desc: "1% of every execution flows into a public, permissionless pool. A policy can reclaim up to 70% of what it contributed after a 30-second cooldown.",
    chips: ["fee 1%", "quota 70%", "cooldown 30s"],
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const headerY = useTransform(scrollYProgress, [0, 0.1], [28, 0]);
  const headerOp = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const bandY = useTransform(scrollYProgress, [0.12, 0.28], [44, 0]);
  const bandOp = useTransform(scrollYProgress, [0.12, 0.28], [0, 1]);

  const cardY0 = useTransform(scrollYProgress, [0.3, 0.42], [44, 0]);
  const cardOp0 = useTransform(scrollYProgress, [0.3, 0.42], [0, 1]);
  const cardY1 = useTransform(scrollYProgress, [0.36, 0.48], [44, 0]);
  const cardOp1 = useTransform(scrollYProgress, [0.36, 0.48], [0, 1]);
  const cardY2 = useTransform(scrollYProgress, [0.42, 0.54], [44, 0]);
  const cardOp2 = useTransform(scrollYProgress, [0.42, 0.54], [0, 1]);

  const cardStyles = [
    { y: cardY0, opacity: cardOp0 },
    { y: cardY1, opacity: cardOp1 },
    { y: cardY2, opacity: cardOp2 },
  ];

  const s = (y: MotionValue<number>, op: MotionValue<number>) =>
    reduce ? { y: 0, opacity: 1 } : { y, opacity: op };

  return (
    <section id="features" ref={containerRef} className="relative lg:h-[260vh]">
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28 lg:min-h-screen lg:sticky lg:top-0 lg:flex lg:flex-col lg:justify-center lg:py-0">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1100px] h-[400px] md:h-[600px] bg-accent/5 blur-[120px] md:blur-[160px] pointer-events-none rounded-[100%]" />

        <div className="relative z-10 mx-auto max-w-7xl w-full">
          {/* Intro — left aligned */}
          <motion.div style={s(headerY, headerOp)} className="max-w-3xl">
            <span className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase">
              Capabilities
            </span>
            <h2 className="mt-4 md:mt-6 text-3xl font-semibold tracking-tight text-ink md:text-5xl">
              Everything the contract enforces.
            </h2>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-muted max-w-xl leading-relaxed">
              Velora is an on-chain firewall. Once a policy is deployed, the agent
              operates strictly within the mathematical limits you set — nothing
              is decided in the browser.
            </p>
          </motion.div>

          {/* Featured band — the policy engine */}
          <motion.div
            style={s(bandY, bandOp)}
            className="mt-8 md:mt-12 relative overflow-hidden rounded-[24px] md:rounded-[28px] bg-surface border border-hairline shadow-2xl flex flex-col lg:flex-row"
          >
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

            <div className="relative p-6 md:p-10 lg:w-3/5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-base border border-hairline flex items-center justify-center text-accent shadow-sm">
                  <ShieldCheck size={18} />
                </span>
                <span className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase">
                  Core Engine
                </span>
              </div>
              <h3 className="text-xl md:text-3xl font-semibold tracking-tight text-ink">
                On-Chain Policy Engine
              </h3>
              <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed max-w-lg" style={{ color: "#9a9aa2" }}>
                Policies are Solidity on BOT Chain — no owner, no admin key, no
                upgrade path. The contract holds the budget, enforces every rule,
                and is the single source of truth for approve and reject.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-md bg-base border border-hairline font-mono text-[10px] md:text-[11px] text-muted">
                  BOT Chain · chainId 677
                </span>
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-base border border-hairline font-mono text-[10px] md:text-[11px] text-accent hover:border-accent/40 transition-colors"
                >
                  scan.botchain.ai
                </a>
              </div>
            </div>

            {/* Mono readout */}
            <div className="relative lg:w-2/5 border-t lg:border-t-0 lg:border-l border-hairline bg-base p-6 md:p-10 font-mono text-xs md:text-[13px] leading-6">
              <div className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-3">
                policy · velora.sol
              </div>
              <div className="space-y-1.5 text-ink/85">
                <Row k="owner" v="0x7A2…4B19" />
                <Row k="destination" v="0x9b4…1a8c" />
                <Row k="action" v="Transfer" accent />
                <Row k="amount / exec" v="5.00 BOT" />
                <Row k="executions" v="0 / 10" />
                <Row k="interval" v="Daily" />
                <Row k="expiration" v="14h 22m" />
                <Row k="fee" v="1% → SafetyNet" accent />
              </div>
            </div>
          </motion.div>

          {/* Feature grid */}
          <div className="mt-4 md:mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, chips }, i) => (
              <motion.div
                key={title}
                style={s(cardStyles[i].y, cardStyles[i].opacity)}
                className="group relative overflow-hidden rounded-2xl bg-surface border border-hairline p-6 md:p-7 transition-colors duration-300 hover:border-hairline/70"
              >
                <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="w-9 h-9 rounded-lg bg-base border border-hairline flex items-center justify-center text-accent shrink-0">
                    <Icon size={16} />
                  </span>
                  <h3 className="text-base md:text-lg font-medium text-ink leading-snug">
                    {title}
                  </h3>
                </div>

                <p className="text-sm text-muted leading-relaxed">{desc}</p>

                <div className="mt-4 md:mt-5 flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="px-2 py-0.5 rounded-md bg-base border border-hairline font-mono text-[10px] text-muted"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted">{k}</span>
      <span className={accent ? "text-accent" : "text-ink/90"}>{v}</span>
    </div>
  );
}
