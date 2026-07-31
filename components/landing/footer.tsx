import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-hairline pt-20 md:pt-32 pb-12 md:pb-16 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl mb-20 md:mb-32 text-center md:text-left mx-auto md:mx-0">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-ink mb-6 md:mb-8 leading-snug">
            The contract is the only authority. Your wallet is never exposed.
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-hairline text-sm text-muted text-center md:text-left">
          <div className="flex items-center gap-2 font-medium text-ink">
            <img src="/velora.png" alt="Velora Logo" className="h-10 w-10 rounded-full scale-[1.5]" />
            Velora
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-muted/50">© 2026 BOT Chain Build Week</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
