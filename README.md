# Velora

**Delegate tasks, not your wallet.**

Velora lets a user grant an AI Agent the ability to *request* on-chain execution,
while a Solidity smart contract remains the sole authority that approves or rejects
that request against an immutable, user-defined policy. The wallet's private key is
never shared, delegated, or exposed to the agent.

Built for **BOT Chain Build Week**.

---

## 1. Smart contract — deploy first

`contracts/Velora.sol` is the single source of truth. Deploy it before touching the
frontend, since the frontend needs its address.

### Deploy via Remix

1. Open [Remix IDE](https://remix.ethereum.org).
2. Create `Velora.sol` and paste the contents of `contracts/Velora.sol`.
3. In the File Explorer, also install the OpenZeppelin dependency: Remix resolves
   `@openzeppelin/contracts/security/ReentrancyGuard.sol` automatically via its GitHub
   import resolver — no extra step needed as long as you're online in the Remix
   workspace.
4. Compiler tab → select `0.8.24` (or any `^0.8.24`-compatible version) → **Compile**.
5. Deploy & Run tab → Environment: **Injected Provider - MetaMask**, network switched
   to **BOT Chain** in MetaMask.
6. Deploy `Velora`. Confirm the transaction in MetaMask.
7. Copy the deployed contract address.
8. Verify the contract on the BOT Chain block explorer (flatten if the explorer needs
   a single file, or verify with the OpenZeppelin import as-is if it supports it).

### Wire the address into the frontend

Edit `contracts/addresses.ts`:

```ts
export const VELORA_ADDRESSES: Record<number, `0x${string}`> = {
  <BOT_CHAIN_CHAIN_ID>: "0xYourDeployedAddress",
};
```

Also confirm the real BOT Chain network parameters in `lib/network.ts`
(`chainIdHex`, `chainIdDecimal`, `rpcUrls`, `blockExplorerUrls`) — placeholders are
marked clearly in that file.

If you regenerate the ABI from Remix's compiled artifact instead of using the
hand-written `contracts/Velora.abi.json` included here, drop the new ABI JSON in the
same place; every hook reads from that one file.

---

## 2. Frontend — local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. MetaMask must be installed in the browser, and switched
(or willing to switch, via the built-in network guard) to BOT Chain.

### Project structure`

```
velora/
├── app/                # Next.js App Router pages (Landing, Dashboard, Create Policy, Simulation)
├── components/          # landing/ dashboard/ create-policy/ simulation/ ui/
├── hooks/                # useWallet, useVeloraContract, usePolicies, usePolicyEvents
├── lib/                  # ethers.ts, network.ts, format.ts, utils.ts
├── contracts/            # Velora.sol, Velora.abi.json, addresses.ts
├── types/                # policy.ts — mirrors the Solidity enums/struct exactly
└── utils/                # validation.ts — client-side UX prediction only, never authoritative
```

**Key principle:** the frontend has zero authority. `utils/validation.ts` predicts a
verdict for instant UI feedback, but the Simulation page always renders its final
result from the emitted `ExecutionApproved` / `ExecutionRejected` event, never from
the prediction.

---

## 3. Deploy the frontend — Vercel

```bash
npm i -g vercel
vercel
```

Or connect the GitHub repo directly in the Vercel dashboard → Import Project → deploy.
No environment variables are required — the deployed contract address lives in
`contracts/addresses.ts`, committed to the repo, since Velora has no backend and no
secrets to hide (100% client-to-contract, per design).

Attach a custom domain in Vercel's Project → Settings → Domains once deployed.

---

## 4. Demo script (under 5 minutes)

1. **Connect MetaMask** on the Landing page or Dashboard.
2. **Create a policy** — e.g. name "Purchase API Credits", budget 10 BOT, destination
   set to any test address, action "Send BOT", expiration 24 hours, max executions 3.
   Deploy — one signed transaction creates and funds it atomically.
3. Policy appears **Active** on the Dashboard with remaining budget 10 BOT.
4. On the **Simulation** page, select the policy, set amount to 3 BOT, click
   **Simulate AI request** → watch the rule-by-rule checklist animate → **Approved**,
   remaining budget drops to 7 BOT.
5. Click **Simulate invalid request** → the amount deliberately exceeds the remaining
   budget → **Rejected**, reason: Insufficient Budget.
6. Back on the Dashboard, **Cancel** the policy, then **Withdraw** the remaining BOT.
   Policy closes.
7. Use **Share on X** on either simulation result to post a ready-made summary.

---

## 5. Security notes carried from the design doc

- Checks-Effects-Interactions on every fund-moving function; `ReentrancyGuard` on
  `executeRequest` and `withdrawRemainingBudget`.
- Legitimate "policy said no" outcomes return `false` + emit `ExecutionRejected` with
  a machine-readable reason instead of reverting — structurally invalid calls
  (nonexistent policy, wrong owner) still revert.
- No agent address binding in v1 (documented v2 improvement) — anyone able to call
  `executeRequest` referencing a policy ID can trigger it, which is why the deposit
  is escrowed by the contract and every rule is still enforced regardless of caller.
- `ownerPolicyIds` is an unbounded array per address — fine at hackathon scale,
  flagged as a v2 pagination concern.
