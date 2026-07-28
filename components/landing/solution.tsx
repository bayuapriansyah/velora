"use client";

import { motion } from "framer-motion";
import { Wallet, Bot, Database, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  })
};

const pulseTick = {
  hidden: { opacity: 0.3, scale: 0.8 },
  visible: (custom: number) => ({
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.2, 1],
    transition: { delay: custom * 1.5, duration: 1.5, repeat: Infinity }
  })
};

export function Solution() {
  return (
    <section className="bg-surface px-6 py-20 md:py-32 border-y border-hairline overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 md:mb-20 max-w-2xl text-center mx-auto">
          <motion.span 
            variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-[10px] md:text-[11px] font-semibold tracking-widest text-muted uppercase"
          >
            The Architecture
          </motion.span>
          <motion.h2 
            variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-4 md:mt-6 text-3xl font-semibold tracking-tight text-ink md:text-5xl"
          >
            An impenetrable policy layer.
          </motion.h2>
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="mt-4 md:mt-6 text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed"
          >
            Your wallet is completely isolated from the agent. The smart contract holds the budget, enforces your rules, and has the final say.
          </motion.p>
        </div>
        
        {/* The Policy Engine Diagram */}
        <div className="relative mx-auto max-w-5xl bg-base rounded-[24px] md:rounded-[40px] border border-hairline p-6 md:p-16 shadow-sm overflow-x-hidden md:overflow-visible">
          {/* Animated Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2a2a2e_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none md:rounded-[40px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Top Row: The Inputs */}
            <div className="flex flex-row justify-between w-full max-w-3xl gap-4 md:gap-0 relative">
              
              {/* Wallet & Policy Creation */}
              <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col items-center z-20 relative w-1/2 md:w-48">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-surface border border-hairline flex items-center justify-center shadow-sm mb-3 md:mb-4">
                  <Wallet size={20} className="text-ink md:w-6 md:h-6" />
                </div>
                <div className="text-center bg-base/80 backdrop-blur-sm px-2 w-full">
                  <h3 className="text-sm md:text-base font-semibold text-ink truncate">1. You (Wallet)</h3>
                  <p className="text-[10px] md:text-xs text-muted mt-1 leading-relaxed hidden md:block">Deposit funds & define the exact rules on-chain.</p>
                </div>
              </motion.div>

              {/* Connecting Line from Wallet to Contract */}
              <div className="hidden md:block absolute top-8 left-[100px] right-1/2 -z-10">
                <div className="w-full border-t border-dashed border-muted/30 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-base px-2 text-[10px] uppercase tracking-widest text-muted font-mono">
                    Create Policy
                  </div>
                  <motion.div 
                    className="absolute top-[-4px] left-0 w-2 h-2 rounded-full bg-ink"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

              {/* Mobile lines pointing down */}
              <div className="md:hidden absolute top-[48px] left-1/4 w-[1px] h-12 border-l border-dashed border-muted/30 -z-10" />
              <div className="md:hidden absolute top-[48px] right-1/4 w-[1px] h-12 border-l border-dashed border-accent/30 -z-10" />

              {/* AI Agent Request */}
              <motion.div variants={fadeUp} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col items-center z-20 relative w-1/2 md:w-48">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-surface border border-hairline flex items-center justify-center shadow-sm mb-3 md:mb-4 relative">
                  {/* Warning label to emphasize isolation */}
                  <div className="absolute -top-3 md:-right-6 bg-rejected/10 border border-rejected/20 text-rejected text-[8px] md:text-[9px] font-bold uppercase px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <Lock size={8} /> No Wallet Access
                  </div>
                  <Bot size={20} className="text-muted md:w-6 md:h-6" />
                </div>
                <div className="text-center bg-base/80 backdrop-blur-sm px-2 w-full">
                  <h3 className="text-sm md:text-base font-semibold text-ink truncate">2. AI Agent</h3>
                  <p className="text-[10px] md:text-xs text-muted mt-1 leading-relaxed hidden md:block">Submits execution requests to the contract.</p>
                </div>
              </motion.div>

              {/* Connecting Line from Agent to Contract */}
              <div className="hidden md:block absolute top-8 left-1/2 right-[100px] -z-10">
                <div className="w-full border-t border-dashed border-accent/30 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-base px-2 text-[10px] uppercase tracking-widest text-accent font-mono">
                    Request Execution
                  </div>
                  <motion.div 
                    className="absolute top-[-4px] right-0 w-2 h-2 rounded-full bg-accent"
                    animate={{ right: ["0%", "100%"] }}
                    transition={{ duration: 2.5, delay: 1.25, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

            </div>

            {/* Vertical Lines linking to Contract */}
            <div className="w-full hidden md:flex justify-center h-12 relative -z-10">
              <div className="w-px h-full border-l border-dashed border-hairline" />
            </div>
            {/* Mobile gap */}
            <div className="h-10 md:hidden w-full relative -z-10"></div>

            {/* Centerpiece: Velora Policy Engine (Smart Contract) */}
            <motion.div 
              variants={fadeUp} custom={5} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="relative z-20 group w-full max-w-[280px] md:max-w-md"
            >
              <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="bg-surface rounded-2xl md:rounded-[24px] border border-accent/50 p-5 md:p-8 shadow-[0_0_30px_-5px_rgba(252,76,2,0.15)] relative overflow-hidden text-center group-hover:border-accent transition-colors duration-500">
                
                {/* Scanning Laser Animation */}
                <motion.div 
                  className="absolute top-0 left-0 w-full h-[1px] bg-accent/50 shadow-[0_0_15px_rgba(252,76,2,0.8)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <Database size={24} className="text-accent md:w-7 md:h-7" />
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-semibold text-ink leading-none">Velora.sol</h3>
                    <p className="text-[9px] md:text-[10px] text-accent font-semibold tracking-widest uppercase mt-1">Immutable Policy Engine</p>
                  </div>
                </div>
                
                {/* Active Validation Steps */}
                <div className="bg-base rounded-xl p-3 md:p-4 border border-hairline text-left space-y-2.5 md:space-y-3 font-mono text-[10px] md:text-xs text-muted relative">
                  <div className="absolute -top-3 left-3 md:left-4 bg-surface px-2 text-[9px] md:text-[10px] font-bold text-ink uppercase tracking-wider">
                    On-chain Validation
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 md:pt-2">
                    <span className="text-ink truncate">1. Check Signature</span>
                    <motion.div variants={pulseTick} custom={0} initial="hidden" animate="visible" className="shrink-0 ml-2">
                      <ShieldCheck size={12} className="text-approved md:w-3.5 md:h-3.5" />
                    </motion.div>
                  </div>
                  <div className="w-full h-px bg-hairline/50" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-ink truncate">2. Verify Budget</span>
                    <motion.div variants={pulseTick} custom={1} initial="hidden" animate="visible" className="shrink-0 ml-2">
                      <ShieldCheck size={12} className="text-approved md:w-3.5 md:h-3.5" />
                    </motion.div>
                  </div>
                  <div className="w-full h-px bg-hairline/50" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-ink truncate">3. Enforce Limits</span>
                    <motion.div variants={pulseTick} custom={2} initial="hidden" animate="visible" className="shrink-0 ml-2">
                      <ShieldCheck size={12} className="text-approved md:w-3.5 md:h-3.5" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vertical Line down to Execution */}
            <div className="w-full flex justify-center h-8 md:h-12 relative -z-10">
              <div className="w-px h-full border-l border-dashed border-hairline relative">
                <motion.div 
                  className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-accent"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Bottom Row: Validation & Execution */}
            <motion.div variants={fadeUp} custom={6} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full max-w-2xl bg-surface border border-hairline rounded-2xl md:rounded-[24px] relative z-10 overflow-hidden shadow-sm">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-hairline">
                
                {/* Approved Path */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center relative group hover:bg-approved/5 transition-colors duration-500">
                  <div className="absolute inset-0 bg-approved/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-approved/10 border border-approved/20 flex items-center justify-center mb-3 md:mb-4 relative z-10">
                    <CheckCircle2 size={20} className="text-approved md:w-6 md:h-6" />
                  </div>
                  <h4 className="text-base md:text-lg font-medium text-ink relative z-10">Execution Approved</h4>
                  <p className="text-xs md:text-sm text-muted mt-2 relative z-10 hidden md:block">Transaction is routed to the destination contract and budget is updated.</p>
                </div>

                {/* Reverted Path */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center relative group hover:bg-rejected/5 transition-colors duration-500">
                  <div className="absolute inset-0 bg-rejected/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-rejected/10 border border-rejected/20 flex items-center justify-center mb-3 md:mb-4 relative z-10">
                    <XCircle size={20} className="text-rejected md:w-6 md:h-6" />
                  </div>
                  <h4 className="text-base md:text-lg font-medium text-ink relative z-10">Execution Reverted</h4>
                  <p className="text-xs md:text-sm text-muted mt-2 relative z-10 hidden md:block">Agent is blocked instantly if rules are broken. Your funds stay safe.</p>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
