"use client";

import { motion } from "framer-motion";
import { Lock, Timer, Database, CheckCircle2, XCircle, ArrowRight, Activity, ShieldCheck } from "lucide-react";

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1200px] h-[300px] md:h-[600px] bg-accent/5 blur-[100px] md:blur-[150px] pointer-events-none rounded-[100%]" />
      
      <div className="mb-12 md:mb-16 max-w-2xl text-center mx-auto relative z-10">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase"
        >
          Active Constraints
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 md:mt-6 text-3xl font-semibold tracking-tight text-ink md:text-5xl"
        >
          Everything the contract enforces.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 md:mt-6 text-base md:text-lg text-muted"
        >
          Velora acts as an on-chain firewall. Once a policy is deployed, the agent operates strictly within the mathematical limits you set.
        </motion.p>
      </div>
      
      {/* Policy Inspector Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-5xl rounded-[24px] md:rounded-[32px] bg-surface border border-hairline shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Column: Live Constraints */}
        <div className="w-full md:w-5/12 bg-base p-6 md:p-10 border-b md:border-b-0 md:border-r border-hairline">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h3 className="text-lg md:text-xl font-medium text-ink flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent md:w-5 md:h-5" />
                Policy Inspector
              </h3>
              <p className="text-[10px] md:text-xs font-mono text-muted mt-1">ID: pol_0x9b4f2...1a8c</p>
            </div>
            <div className="bg-approved/10 text-approved border border-approved/20 text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-approved animate-pulse" /> Live
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            {/* Budget Usage */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-ink">
                  <Database size={14} className="text-muted md:w-4 md:h-4" /> Budget Usage
                </div>
                <div className="text-xs md:text-sm font-mono text-ink">750 <span className="text-muted text-[10px] md:text-xs">/ 1000 USDC</span></div>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-hairline/50">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "75%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-accent rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30" />
                </motion.div>
              </div>
            </div>

            {/* Execution Count */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-ink">
                  <Activity size={14} className="text-muted md:w-4 md:h-4" /> Execution Limit
                </div>
                <div className="text-xs md:text-sm font-mono text-ink">3 <span className="text-muted text-[10px] md:text-xs">/ 10 txs</span></div>
              </div>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-1.5 md:h-2 flex-1 rounded-full ${i < 3 ? 'bg-accent' : 'bg-surface border border-hairline/50'}`} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline/50">
              {/* Expiration */}
              <div>
                <div className="text-[9px] md:text-[10px] font-semibold tracking-wider uppercase text-muted mb-1 flex items-center gap-1.5">
                  <Timer size={10} className="md:w-3 md:h-3" /> Expires In
                </div>
                <div className="text-base md:text-lg font-mono text-ink">14h 22m</div>
              </div>

              {/* Destination Lock */}
              <div>
                <div className="text-[9px] md:text-[10px] font-semibold tracking-wider uppercase text-muted mb-1 flex items-center gap-1.5">
                  <Lock size={10} className="md:w-3 md:h-3" /> Destination
                </div>
                <div className="text-xs md:text-sm font-mono text-ink truncate bg-surface px-2 py-1 rounded border border-hairline">
                  0x7A2...4B19
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Log */}
        <div className="w-full md:w-7/12 bg-surface p-6 md:p-10 flex flex-col">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm font-medium text-ink uppercase tracking-wider">On-Chain Audit Trail</h3>
            <span className="text-[10px] md:text-xs text-muted font-mono">Last 3 requests</span>
          </div>

          <div className="flex-1 space-y-3 md:space-y-4">
            
            {/* Blocked Request (Most Recent) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-base rounded-xl border border-rejected/30 p-3 md:p-4 relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rejected" />
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 md:gap-2 text-rejected text-xs md:text-sm font-medium">
                  <XCircle size={14} className="md:w-4 md:h-4" /> Execution Reverted
                </div>
                <div className="text-[10px] md:text-xs font-mono text-muted">Just now</div>
              </div>
              <div className="font-mono text-[10px] md:text-xs text-ink/80 mb-2 md:mb-3 bg-surface p-2 rounded border border-hairline/50 overflow-x-auto whitespace-nowrap">
                agent.execute(0x7A2...4B19, <span className="text-rejected">500 USDC</span>)
              </div>
              <div className="text-[10px] md:text-xs text-rejected/80 font-medium leading-relaxed">
                Reason: Amount exceeds remaining budget (250 USDC).
              </div>
            </motion.div>

            {/* Allowed Request */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="bg-base rounded-xl border border-hairline p-3 md:p-4 relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-approved opacity-50" />
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 md:gap-2 text-approved text-xs md:text-sm font-medium">
                  <CheckCircle2 size={14} className="md:w-4 md:h-4" /> Execution Approved
                </div>
                <div className="text-[10px] md:text-xs font-mono text-muted">2 hrs ago</div>
              </div>
              <div className="font-mono text-[10px] md:text-xs text-ink/80 bg-surface p-2 rounded border border-hairline/50 flex justify-between items-center overflow-x-auto whitespace-nowrap gap-4">
                <span>agent.execute(0x7A2...4B19, 250 USDC)</span>
                <a href="#" className="text-accent hover:underline flex items-center gap-1 shrink-0">Tx <ArrowRight size={10} /></a>
              </div>
            </motion.div>

            {/* Allowed Request 2 */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0 }}
              className="bg-base rounded-xl border border-hairline p-3 md:p-4 relative opacity-60"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-approved opacity-50" />
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 md:gap-2 text-approved text-xs md:text-sm font-medium">
                  <CheckCircle2 size={14} className="md:w-4 md:h-4" /> Execution Approved
                </div>
                <div className="text-[10px] md:text-xs font-mono text-muted">12 hrs ago</div>
              </div>
              <div className="font-mono text-[10px] md:text-xs text-ink/80 bg-surface p-2 rounded border border-hairline/50 flex justify-between items-center overflow-x-auto whitespace-nowrap gap-4">
                <span>agent.execute(0x7A2...4B19, 500 USDC)</span>
                <a href="#" className="text-accent hover:underline flex items-center gap-1 shrink-0">Tx <ArrowRight size={10} /></a>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}
