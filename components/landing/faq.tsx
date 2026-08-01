"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Does the agent ever see my private key?",
    a: "No. The key never leaves your wallet. The agent can only call executeRequest() — the contract independently decides whether to honor it.",
  },
  {
    q: "What happens to my BOT while a policy is active?",
    a: "It's locked inside Velora.sol, the deployed contract — not held by Velora the company, a server, or the agent.",
  },
  {
    q: "Can a policy be edited after it's created?",
    a: "No — policies are immutable by design. You can cancel a policy and withdraw the remaining budget, then create a new one.",
  },
  {
    q: "Is the 'AI agent' real?",
    a: "Yes. Velora ships a real autonomous agent — it holds its own gas-only wallet, scans your active policies, asks Gemini whether to act, and submits the executeRequest() call. Even then, the contract alone decides: the AI's \"yes\" can still be rejected on-chain. The Simulation page replays the same calls from the browser so you can test rules without the agent.",
  },
  {
    q: "What chain does this run on?",
    a: "BOT Chain. Velora.sol is deployed there and verified, with the address pinned in the frontend config.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            Questions, answered.
          </motion.h2>
        </div>
        
        <div className="divide-y divide-hairline border-y border-hairline">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div 
                key={f.q} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group py-2"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-6 text-left focus:outline-none"
                >
                  <span className={`text-xl font-medium transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-ink group-hover:text-accent'}`}>
                    {f.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-muted group-hover:text-ink'}`}
                  >
                    <Plus size={20} strokeWidth={2} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 pr-12 text-lg leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
