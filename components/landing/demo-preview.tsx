import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DemoPreview() {
  return (
    <section className="px-6 py-24 md:py-32 bg-black/35 backdrop-blur-md">
      <div className="mx-auto max-w-4xl rounded-[40px] bg-surface p-12 text-center border border-hairline md:p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-bloom opacity-30 pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-5xl mb-6">
            See it decide, live
          </h2>
          <p className="mx-auto max-w-lg text-lg text-muted mb-12">
            No mocked UI. The Simulation page sends a real transaction to Velora.sol and
            renders whatever it decides, rule by rule.
          </p>
          <Link href="/simulation">
            <Button size="lg" className="group rounded-full bg-accent hover:bg-accent-hover text-white h-14 px-8 text-base font-medium shadow-md shadow-accent/20 transition-all duration-300">
              Try the simulation
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
