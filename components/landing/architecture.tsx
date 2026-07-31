export function Architecture() {
  return (
    <section className="px-6 py-20 md:py-32 border-y border-hairline bg-black/25 backdrop-blur-[3px]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 md:mb-16 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-5xl mb-4 md:mb-6">
            The frontend has zero authority.
          </h2>
          <p className="text-base md:text-lg text-muted">
            It only reads policy state and submits transactions the contract independently
            validates. Nothing about approval or rejection is decided in the browser.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-hairline bg-base">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="p-8 md:p-10 hover:bg-surfaceHover transition-colors text-center md:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Browser</p>
              <p className="mt-2 md:mt-4 text-xl md:text-2xl font-medium text-ink">Next.js app</p>
              <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed" style={{ color: '#5a5a5cff' }}>Landing, Dashboard, Create Policy, Simulation — reads state, submits transactions.</p>
            </div>
            <div className="p-8 md:p-10 hover:bg-surfaceHover transition-colors text-center md:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Transport</p>
              <p className="mt-2 md:mt-4 text-xl md:text-2xl font-medium text-ink">MetaMask</p>
              <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed" style={{ color: '#5a5a5cff' }}>Every write is a signed transaction the user approves — no backend in between.</p>
            </div>
            <div className="p-8 md:p-10 hover:bg-surfaceHover transition-colors text-center md:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">BOT Chain</p>
              <p className="mt-2 md:mt-4 text-xl md:text-2xl font-medium text-ink">Velora.sol</p>
              <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed" style={{ color: '#5a5a5cff' }}>Policy engine and fund custody. The single source of truth for approve/reject.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
