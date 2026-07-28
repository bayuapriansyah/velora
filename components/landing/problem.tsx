"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Bot, Key, User, ArrowRight, XCircle, Clock } from "lucide-react";

export function Problem() {
  return (
    <section className="relative overflow-hidden bg-base px-6 py-20 md:py-40 border-t border-hairline">
      {/* Background glow for contrast */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] bg-accent/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-16 md:mb-20 text-center max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-medium tracking-tight text-ink mb-6"
          >
            The current tradeoff is broken.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted"
          >
            Today's AI agents force you to choose between security and automation.
          </motion.p>
        </div>

        {/* Visual Comparison Diagram */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 relative">
          
          {/* Option A: Full Access (High Risk) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[24px] md:rounded-[32px] bg-surface border border-hairline p-6 md:p-12 relative overflow-hidden group hover:border-hairline/80 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <ShieldAlert size={120} className="text-red-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-8 md:mb-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 font-mono text-sm font-bold">
                A
              </div>
              <h3 className="text-lg md:text-xl font-medium text-ink">Full Wallet Access</h3>
            </div>

            {/* Diagram */}
            <div className="bg-base border border-hairline rounded-2xl p-6 mb-8 md:mb-10 relative">
              <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6 md:gap-0">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center">
                    <User size={20} className="text-muted" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-semibold">You</span>
                </div>
                
                <div className="flex-1 px-4 relative flex flex-col items-center justify-center py-2 md:py-0 w-full md:w-auto">
                  <div className="hidden md:block w-full border-t border-dashed border-red-500/50 absolute top-1/2 -translate-y-1/2 -z-10" />
                  <div className="md:hidden h-full border-l border-dashed border-red-500/50 absolute left-1/2 -translate-x-1/2 top-0 -z-10" />
                  <div className="bg-red-500/10 text-red-500 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-red-500/20 mb-2 bg-base z-10">
                    Private Key
                  </div>
                  <ArrowRight size={16} className="text-red-500/50 rotate-90 md:rotate-0 z-10 bg-base rounded-full" />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface border border-red-500/30 flex items-center justify-center relative shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]">
                    <Bot size={20} className="text-ink" />
                    <Key size={12} className="absolute -bottom-1 -right-1 text-red-500 bg-surface rounded-full p-0.5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-ink font-semibold">AI Agent</span>
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#5a5a5cff' }}>
              Hand the agent your private key or a session with unlimited spend. You get full automation, but one bug or prompt injection empties your wallet.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-red-500/80">
              <XCircle size={16} /> Zero Security
            </div>
          </motion.div>

          {/* Option B: Manual Approval (High Friction) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[24px] md:rounded-[32px] bg-surface border border-hairline p-6 md:p-12 relative overflow-hidden group hover:border-hairline/80 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Clock size={120} className="text-accent" />
            </div>

            <div className="flex items-center gap-3 mb-8 md:mb-10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-mono text-sm font-bold">
                B
              </div>
              <h3 className="text-lg md:text-xl font-medium text-ink">Manual Approval</h3>
            </div>

            {/* Diagram */}
            <div className="bg-base border border-hairline rounded-2xl p-6 mb-8 md:mb-10 relative">
              <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6 md:gap-0">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface border border-hairline flex items-center justify-center">
                    <Bot size={20} className="text-muted" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-semibold">AI Agent</span>
                </div>
                
                <div className="flex-1 px-4 relative flex flex-col items-center justify-center py-2 md:py-0 w-full md:w-auto">
                  <div className="hidden md:block w-full border-t border-dashed border-accent/50 absolute top-1/2 -translate-y-1/2 -z-10" />
                  <div className="md:hidden h-full border-l border-dashed border-accent/50 absolute left-1/2 -translate-x-1/2 top-0 -z-10" />
                  <div className="bg-accent/10 text-accent rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-accent/20 mb-2 whitespace-nowrap bg-base z-10">
                    Tx Pending...
                  </div>
                  <ArrowRight size={16} className="text-accent/50 rotate-90 md:rotate-0 z-10 bg-base rounded-full" />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-surface border border-accent flex items-center justify-center relative shadow-[0_0_15px_-3px_rgba(252,76,2,0.3)]">
                    <User size={20} className="text-ink" />
                    <Clock size={12} className="absolute -bottom-1 -right-1 text-accent bg-surface rounded-full p-0.5" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-ink font-semibold">You (Waiting)</span>
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed mb-6" style={{ color: '#5a5a5cff' }}>
              Confirm every single transaction yourself in MetaMask. You get total security, but it's exactly the babysitting automation was supposed to remove.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-accent/80">
              <XCircle size={16} /> Zero Automation
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
