# Velora Autonomous Agent

This is the piece that turns Velora's demo from "a UI you click" into an actual
autonomous agent: a standalone script with its **own wallet**, that decides on
its own schedule whether to request a transaction, and calls the Velora smart
contract **without any human clicking anything** after it starts.

It does not bypass the trust model described in the SDD — it can only ever
*request* execution. The Velora smart contract is still the sole authority
that approves or rejects it, using the exact same rules (budget, destination,
action, expiration, execution count) as every other caller.

## What it proves

| Before (manual approval) | With this agent |
|---|---|
| Human approves every transaction | Human approves once — when creating the policy |
| Nothing happens without a click | Agent wakes up, decides, and acts on its own schedule |

## Setup

1. **Create a separate wallet for the agent** — never reuse your personal wallet's
   private key here. In MetaMask: Account menu → Add account → copy its private
   key (Account details → Show private key). Fund it with a *small* amount of
   BOT (just enough for gas — it never needs the policy's budget itself, the
   contract releases that on approval).

2. Get a free Gemini API key: <https://aistudio.google.com/app/apikey>

3. Install and configure:
   ```bash
   cd agent
   npm install
   cp .env.example .env
   ```
   Fill in `.env`:
   - `CONTRACT_ADDRESS` — your deployed Velora.sol address
   - `AGENT_PRIVATE_KEY` — the **agent's own** wallet private key (step 1)
   - `POLICY_ID` — the policy this agent is allowed to act on (see it on your Dashboard)
   - `DESTINATION` and `ACTION_TYPE` — must match that policy's `allowedDestination` / `allowedAction` exactly, or every request will be rejected with ActionMismatch/DestinationMismatch
   - `GEMINI_API_KEY` — from step 2

4. Run it:
   ```bash
   npm start        # runs forever, checking every INTERVAL_MINUTES
   npm run once      # runs a single decision cycle then exits — good for a quick demo
   ```

## What you'll see in the terminal

```
[2026-07-29T10:00:00.000Z] Velora Autonomous Agent starting.
[2026-07-29T10:00:00.100Z] Agent wallet address: 0x...
[2026-07-29T10:00:00.300Z] Agent wallet gas balance: 0.05 BOT
[2026-07-29T10:00:00.500Z] Checking policy state...
[2026-07-29T10:00:00.700Z] Policy snapshot: { ... }
[2026-07-29T10:00:01.200Z] Gemini decision: { shouldRequest: true, amountBot: '0.01', reasoning: '...' }
[2026-07-29T10:00:01.300Z] Requesting execution: 0.01 BOT to 0x... (action: Transfer)...
[2026-07-29T10:00:03.100Z] Transaction submitted: 0x...
[2026-07-29T10:00:03.900Z] ✅ APPROVED — 0.01 BOT sent. Remaining budget: 0.04 BOT.
```

For a demo recording: start it with `npm start`, then **step away from the
keyboard** — let it run a couple of cycles on its own. Refresh the Velora
Dashboard in another window and watch the remaining budget and activity feed
update without you touching anything. That's the proof of real automation.

## Safety notes

- The agent's own wallet only ever needs enough BOT to pay gas — never fund it
  with the actual spending budget. The policy's locked budget in the contract
  is what actually moves.
- If `DESTINATION` or `ACTION_TYPE` in `.env` don't match the policy exactly,
  every request will be rejected on-chain (which is correct behavior — it
  proves the contract's validation works even against a real autonomous
  caller, not just the UI).
- Gemini's decision is advisory only. A "yes" from the model can still be
  rejected by the contract (e.g. if the budget ran out between decision and
  submission) — that's expected and is the whole point of the trust model.
