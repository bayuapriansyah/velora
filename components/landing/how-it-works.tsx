"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Wallet, Settings, Activity, CheckCircle2, XCircle, LogOut, ChevronRight, ArrowRight } from "lucide-react";

const steps = [
  { id: 1, title: "Connect MetaMask", icon: Wallet, detail: "One click, on BOT Chain." },
  { id: 2, title: "Create a policy", icon: Settings, detail: "10 BOT budget, OpenRouter destination, 24h limit." },
  { id: 3, title: "Policy goes Active", icon: Activity, detail: "10 BOT locked in contract." },
  { id: 4, title: "Valid AI request", icon: CheckCircle2, detail: "Request 3 BOT. Approved. Remaining: 7 BOT." },
  { id: 5, title: "Invalid AI request", icon: XCircle, detail: "Request 20 BOT. Rejected." },
  { id: 6, title: "Cancel & withdraw", icon: LogOut, detail: "Policy closed, 7 BOT returned." },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="how-it-works" className="relative isolate px-6 py-20 md:py-32 overflow-hidden border-t border-hairline">
      {/* Background styling */}
      <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[1000px] h-[300px] md:h-[500px] bg-accent/5 blur-[120px] pointer-events-none rounded-[100%]" />
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
          <m.h2 
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold tracking-tight text-ink md:text-5xl mb-4"
          >
            The whole loop, in under 5 minutes.
          </m.h2>
          <m.p 
            initial={{ y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-muted font-normal leading-relaxed"
          >
            Click through the lifecycle to see exactly how state changes on-chain.
          </m.p>
        </div>
        
        {/* Changed layout for mobile: Interactive UI Preview on top, Timeline below */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Timeline */}
          <div className="w-full lg:col-span-4 relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-hairline -z-10" />
            
            <div className="space-y-2">
              {steps.map((s, i) => {
                const isActive = activeStep === s.id;
                const isPast = activeStep > s.id;
                return (
                  <button 
                    key={s.id} 
                    onClick={() => setActiveStep(s.id)}
                    className={`w-full group relative flex gap-4 md:gap-6 p-4 rounded-2xl transition-all duration-300 text-left ${isActive ? 'bg-surface border border-hairline shadow-sm' : 'hover:bg-surface/50 border border-transparent'}`}
                  >
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${isActive ? 'bg-accent text-white border-accent' : isPast ? 'bg-surface border-hairline text-ink' : 'bg-base border-hairline text-muted'}`}>
                      <s.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <div>
                      <h3 className={`text-sm md:text-base !text-ink font-medium transition-colors ${isActive ? '!text-ink' : 'text-muted group-hover:text-ink'}`}>{s.title}</h3>
                      {isActive && (
                        <m.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-1 md:mt-2 text-xs md:text-sm leading-relaxed text-muted"
                        >
                          {s.detail}
                        </m.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive UI Preview */}
          <div className="w-full lg:col-span-8 lg:sticky lg:top-32">
            <div className="w-full h-[400px] md:h-[500px] bg-surface rounded-[24px] md:rounded-[32px] border border-hairline p-2 shadow-[0_0_50px_-12px_rgba(254,77,71,0.28)] relative overflow-hidden flex flex-col">
              
              {/* Fake Browser Header */}
              <div className="h-10 md:h-12 border-b border-hairline bg-base/50 rounded-t-[16px] md:rounded-t-[24px] flex items-center px-4 gap-2 mb-2 md:mb-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-hairline" />
                </div>
                <div className="mx-auto px-4 md:px-6 py-1 rounded-full bg-surface border border-hairline text-[10px] md:text-[11px] font-mono text-muted flex items-center gap-2">
                  <Wallet size={10} className="md:w-3 md:h-3" /> app.velora.network
                </div>
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 relative p-4 md:p-8 flex items-center justify-center overflow-y-auto">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Connect Wallet */}
                  {activeStep === 1 && (
                    <m.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center w-full max-w-sm">
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-base border border-hairline rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-sm">
                        <Wallet size={24} className="md:w-8 md:h-8 text-muted" />
                      </div>
                      <h3 className="text-lg md:text-xl font-medium text-ink mb-2">Connect to BOT Chain</h3>
                      <p className="text-xs md:text-sm text-muted mb-6 md:mb-8">Authenticate with MetaMask to begin.</p>
                      <button className="w-full h-10 md:h-12 bg-accent hover:bg-accent-hover rounded-xl text-sm md:text-base font-medium transition-colors shadow-md shadow-accent/20" style={{ color : '#ffffff' }}>
                        Connect Wallet
                      </button>
                    </m.div>
                  )}

                  {/* Step 2: Create Policy */}
                  {activeStep === 2 && (
                    <m.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md bg-base rounded-2xl border border-hairline p-5 md:p-6 shadow-sm">
                      <h3 className="text-base md:text-lg font-medium text-ink mb-4 md:mb-6 border-b border-hairline pb-3 md:pb-4">Create New Policy</h3>
                      <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        <div>
                          <label className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1.5 md:mb-2 block">Agent Destination</label>
                          <div className="w-full h-9 md:h-10 bg-surface border border-hairline rounded-lg px-3 flex items-center text-xs md:text-sm font-mono text-ink">0xOpenRouter...4A2</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <label className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1.5 md:mb-2 block">Budget (BOT)</label>
                            <div className="w-full h-9 md:h-10 bg-surface border border-hairline rounded-lg px-3 flex items-center text-xs md:text-sm font-mono text-ink">10.00</div>
                          </div>
                          <div>
                            <label className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1.5 md:mb-2 block">Limit</label>
                            <div className="w-full h-9 md:h-10 bg-surface border border-hairline rounded-lg px-3 flex items-center text-xs md:text-sm font-mono text-ink truncate">3 Execs</div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full h-10 md:h-12 bg-accent text-sm md:text-base rounded-xl font-medium transition-colors flex items-center justify-center gap-2" style={{ color : '#ffffff' }}>
                        Sign Tx <ChevronRight size={16} />
                      </button>
                    </m.div>
                  )}

                  {/* Step 3: Policy Active */}
                  {activeStep === 3 && (
                    <m.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md">
                      <div className="bg-base rounded-2xl border border-hairline p-5 md:p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-approved" />
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                          <div>
                            <h3 className="text-base md:text-lg font-medium text-ink">API Credits Agent</h3>
                            <p className="text-[10px] md:text-xs text-muted font-mono mt-1">ID: pol_0x9b...1f</p>
                          </div>
                          <div className="bg-approved/10 text-approved text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-approved/20">
                            Active
                          </div>
                        </div>
                        <div className="bg-surface rounded-xl p-3 md:p-4 border border-hairline">
                          <div className="text-[10px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1">Remaining Budget</div>
                          <div className="text-2xl md:text-3xl font-mono text-ink">10.00 <span className="text-xs md:text-sm text-muted">BOT</span></div>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {/* Step 4: Valid Request */}
                  {activeStep === 4 && (
                    <m.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-lg space-y-3 md:space-y-4">
                      {/* Terminal execution */}
                      <div className="bg-base rounded-xl p-3 md:p-4 font-mono text-[10px] md:text-xs shadow-xl">
                        <div className="text-white/55 mb-1.5 md:mb-2">// AI Agent executes transaction</div>
                        <div className="text-white/80 mb-1"><span className="text-accent">agent</span>.requestTransfer(3.00, dest)</div>
                        <div className="text-approved flex items-center gap-2 mt-2 md:mt-3"><CheckCircle2 size={12} /> Execution Approved</div>
                      </div>
                      
                      {/* Updated state */}
                      <div className="bg-base rounded-2xl border border-hairline p-4 md:p-6 shadow-sm flex items-center justify-between">
                        <div>
                          <div className="text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1">Remaining Budget</div>
                          <div className="text-lg md:text-2xl font-mono text-ink flex items-center gap-2 md:gap-3">
                            <span className="line-through text-muted/50">10.00</span>
                            <ArrowRight size={12} className="text-muted md:w-3.5 md:h-3.5" />
                            7.00 <span className="text-[10px] md:text-sm text-muted">BOT</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1">Executions</div>
                          <div className="text-xs md:text-sm font-mono text-ink">1 / 3</div>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {/* Step 5: Invalid Request */}
                  {activeStep === 5 && (
                    <m.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-lg space-y-3 md:space-y-4">
                      {/* Terminal execution */}
                      <div className="bg-base rounded-xl p-3 md:p-4 font-mono text-[10px] md:text-xs shadow-xl">
                        <div className="text-white/55 mb-1.5 md:mb-2">// AI Agent executes oversized transaction</div>
                        <div className="text-white/80 mb-1"><span className="text-accent">agent</span>.requestTransfer(20.00, dest)</div>
                        <div className="text-rejected flex items-center gap-2 mt-2 md:mt-3"><XCircle size={12} /> Execution Reverted: Exceeds Budget</div>
                      </div>
                      
                      {/* Unchanged state */}
                      <div className="bg-base rounded-2xl border border-hairline p-4 md:p-6 shadow-sm flex items-center justify-between border-rejected/30 bg-rejected/5">
                        <div>
                          <div className="text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-rejected mb-1">Budget (Unchanged)</div>
                          <div className="text-lg md:text-2xl font-mono text-ink">7.00 <span className="text-[10px] md:text-sm text-muted">BOT</span></div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] md:text-[11px] font-semibold tracking-wider uppercase text-muted mb-1">Executions</div>
                          <div className="text-xs md:text-sm font-mono text-ink">1 / 3</div>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {/* Step 6: Cancelled */}
                  {activeStep === 6 && (
                    <m.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-md">
                      <div className="bg-base rounded-2xl border border-hairline p-5 md:p-6 shadow-sm relative overflow-hidden border-muted/30">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
                        <div className="flex justify-between items-start mb-6 md:mb-8">
                          <div>
                            <h3 className="text-base md:text-lg font-medium text-ink">API Credits Agent</h3>
                            <p className="text-[10px] md:text-xs text-muted font-mono mt-1">ID: pol_0x9b...1f</p>
                          </div>
                          <div className="bg-muted/10 text-muted text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-muted/20">
                            Closed
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:gap-4 bg-surface rounded-xl p-3 md:p-4 border border-hairline">
                          <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-approved/10 flex items-center justify-center text-approved">
                            <CheckCircle2 size={16} className="md:w-4.5 md:h-4.5" />
                          </div>
                          <div>
                            <div className="text-xs md:text-sm font-medium text-ink">7.00 BOT Refunded</div>
                            <div className="text-[10px] md:text-xs text-muted mt-0.5">Funds returned to wallet instantly.</div>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
