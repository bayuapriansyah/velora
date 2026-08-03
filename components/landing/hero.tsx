import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Key, Cpu, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-28 md:pb-28" id="hero">
      {/* Deep layered atmospheric background */}
      <div className="absolute inset-0 velora-noise opacity-20 mix-blend-overlay -z-10 pointer-events-none" />
      
      <div className="hero-glow absolute rounded-full blur-3xl md:blur-[100px] pointer-events-none top-[-20%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/20" />
      <div className="hero-glow absolute rounded-full blur-3xl md:blur-[100px] pointer-events-none bottom-[-20%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-accent/10" />
      <div className="hero-glow absolute rounded-full blur-3xl md:blur-[100px] pointer-events-none top-[40%] left-[40%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-white/5" />

      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Editorial Typography & Copy */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <div className="hero-fade-1">
            <span className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full bg-surface/80 border border-hairline px-4 py-1.5 text-[11px] font-semibold tracking-widest text-muted backdrop-blur-xl uppercase shadow-sm">
              <ShieldCheck size={14} className="text-accent" /> Built for BOT Chain
            </span>
          </div>
          
          <h1 
            className="hero-fade-2 text-5xl font-medium leading-[1.05] tracking-tighter text-ink md:text-7xl lg:text-[88px]"
          >
            Delegate tasks,<br />
            <span className="text-muted/80 italic font-serif tracking-tight">not your wallet.</span>
          </h1>
          
          <p 
            className="hero-fade-3 mt-6 md:mt-8 max-w-md text-base md:text-lg leading-relaxed text-muted font-normal"
          >
            Safely authorize AI agents through programmable blockchain policies. Your
            private key stays yours — a smart contract independently validates what an agent
            is allowed to do.
          </p>
          
          <div 
            className="hero-fade-4 mt-10 md:mt-12 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group h-14 px-8 rounded-full bg-accent text-white hover:bg-accent-hover shadow-[0_0_40px_-10px_rgba(252,76,2,0.5)] transition-all duration-300">
                Deploy Policy
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Complex Asymmetric Composition */}
        <div className="preview-fade lg:col-span-6 relative h-[400px] sm:h-[500px] md:h-[600px] w-full mt-8 lg:mt-0 perspective-1000">
          
          <div className="absolute inset-0 origin-top-left sm:origin-top lg:origin-center scale-[0.65] sm:scale-75 lg:scale-100 w-[500px] lg:w-full">
            {/* Dashboard Preview (Back Layer) */}
            <div
              className="preview-back absolute top-0 right-0 lg:-right-10 w-[500px] h-[400px] bg-base border border-hairline rounded-2xl shadow-2xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Dashboard Header */}
              <div className="h-12 border-b border-hairline bg-surface/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                  <div className="w-2.5 h-2.5 rounded-full bg-hairline" />
                </div>
                <div className="mx-auto px-4 py-1 rounded-md bg-base border border-hairline text-[10px] font-mono text-muted">
                  app.velora.network/dashboard
                </div>
              </div>
              {/* Dashboard Content */}
              <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted uppercase tracking-widest mb-1">Active Budget</h3>
                    <div className="text-3xl font-mono text-ink">1,250 <span className="text-muted text-lg">BOT</span></div>
                  </div>
                  <div className="w-16 h-8 rounded-full bg-approved/10 border border-approved/20 flex items-center justify-center text-xs font-medium text-approved">
                    Live
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="preview-row h-16 rounded-xl bg-surface border border-hairline flex items-center px-4 gap-4"
                      style={{ animationDelay: `${0.5 + (i * 0.1)}s` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-base border border-hairline flex items-center justify-center">
                        <Zap size={14} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-24 bg-muted/20 rounded-full mb-2" />
                        <div className="h-2 w-16 bg-muted/10 rounded-full" />
                      </div>
                      <div className="text-xs font-mono text-muted">{i * 2.5}s ago</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blockchain Policy Flow (Front Layer) */}
            <div
              className="preview-front absolute bottom-[-100px] lg:bottom-10 left-0 lg:left-10 w-[420px] rounded-2xl bg-surface/40 backdrop-blur-2xl border border-hairline/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-medium text-ink">Policy Execution Flow</div>
                <Activity size={16} className="text-accent" />
              </div>

              <div className="relative">
                {/* Connection line */}
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-hairline" />


                {/* Nodes */}
                <div className="space-y-6 relative z-10">
                  
                  {/* Node 1: AI Agent */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-base border border-hairline flex items-center justify-center shadow-inner">
                      <Cpu size={20} className="text-muted" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">AI Agent Request</div>
                      <div className="text-xs text-muted mt-1 font-mono">execute(0x7A...4B)</div>
                    </div>
                  </div>

                  {/* Node 2: Smart Contract */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent border border-accent-hover flex items-center justify-center shadow-[0_0_20px_-5px_rgba(252,76,2,0.5)]">
                      <Database size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-accent">Velora.sol Validation</div>
                      <div className="text-xs text-muted mt-1">Checking rules & limits...</div>
                    </div>
                  </div>

                  {/* Node 3: Wallet Action */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-approved/10 border border-approved/30 flex items-center justify-center">
                      <Key size={20} className="text-approved" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-approved">Action Approved</div>
                      <div className="text-xs text-approved/60 mt-1 font-mono">budget -= 10.00 BOT</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
