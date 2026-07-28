# AGENTS.md

## What this is

Velora is a Next.js 15 (App Router) frontend for a Solidity smart contract that lets users create on-chain policies for AI agent execution. No backend, no env vars — 100% client-to-contract. Target chain: BOT Chain Testnet (chainId 968).

## Commands

- `npm run dev` — start dev server on :3000
- `npm run build` — production build (use this to verify changes compile)
- `npm run lint` — ESLint via `next lint` (eslint-config-next)

No test suite exists. No formatter configured (no Prettier).

## Architecture

| Dir | Role |
|---|---|
| `app/` | Next.js App Router pages: Landing (`page.tsx`), Dashboard, Create Policy, Simulation |
| `components/` | UI grouped by page: `landing/`, `dashboard/`, `create-policy/`, `simulation/`, `ui/` |
| `hooks/` | `useWallet`, `useVeloraContract`, `usePolicies`, `usePolicyEvents` |
| `lib/` | `ethers.ts` (provider/signer), `network.ts` (BOT Chain params + `switchToBotChain`), `format.ts`, `utils.ts` |
| `contracts/` | `Velora.sol`, `Velora.abi.json`, `addresses.ts` (chainId → deployed address) |
| `types/` | `policy.ts` — enums mirror Solidity exactly; keep in lockstep |
| `utils/` | `validation.ts` — client-side UX prediction only, never authoritative |

## Key invariants

- **`types/policy.ts` enums must match `Velora.sol` enum ordering.** Solidity enums serialize as uint8 in declaration order. If you add/reorder a Solidity enum, update the TS mirror immediately.
- **`utils/validation.ts` is not authoritative.** The Simulation page always renders results from emitted `ExecutionApproved`/`ExecutionRejected` events, not from the prediction.
- **`contracts/addresses.ts` is committed with a real address.** No `.env` needed. If deploying to a new chain, add the chainId key there.
- **`tailwind.config.ts` content paths are scoped:** only `./app/**` and `./components/**`. New component directories outside those won't get Tailwind classes.
- **Dark mode is configured (`class` strategy) but unused.** The app is light-theme only.

## Style

- Tailwind utility classes with `clsx` + `tailwind-merge` via `class-variance-authority` (CVA).
- Design tokens in `tokens.css` (CSS custom properties, oklch colors) — referenced by Tailwind theme and direct CSS.
- Radix UI primitives for Dialog, Tabs, Slot.
- Framer Motion for animations.
- Fonts: Inter (sans) and JetBrains Mono (mono), loaded via `next/font/google` in `app/layout.tsx`.

## Gotchas

- The contract deploys via Remix (manual), not a Hardhat/Foundry script. ABI is hand-maintained at `contracts/Velora.abi.json`.
- BOT Chain network params live in `lib/network.ts`. The defaults are Testnet; Mainnet values are commented out. Verify RPC/explorer URLs against dev-docs before demo.
- No `npm test` — if you need to verify correctness, `npm run build` is the best compile-time check.
