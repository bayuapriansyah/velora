# Velora Autonomous Agent

An AI-powered agent with its own wallet that autonomously requests executions against the Velora smart contract — no manual clicking required. The contract remains the sole authority that approves or rejects every request; the agent can only *ask*.

## How It Works

1. Scans **all policies** on-chain (starting from ID 0 until `getPolicy()` throws)
2. **Skips** policies that aren't `Active` or aren't due yet (payment interval hasn't elapsed)
3. For each eligible policy, asks Gemini: *"should I request an execution right now?"*
4. If Gemini says yes → calls `executeRequest` using the exact `amountPerExecution` from the policy — no manual amount configuration needed
5. The contract approves or rejects based on the policy's immutable rules (budget, destination, action type, interval, max executions)

**Gross-up fee system:** The SafetyNet fee (1%) was already included in the deposited budget when the policy was created. The agent never sends `msg.value` — just the execution request.

## Using the Agent

### Via the Agent Page (recommended)

Open **`/agent`** in your browser. You'll see:

- All active policies with their current status and next eligible time
- A **Run Cycle** button — click it to trigger one evaluation cycle
- Live log output showing Gemini's decision and the contract's response
- Per-policy results: ✅ Approved / ❌ Rejected / ⏭️ Skipped / ⚠️ Error
- The agent wallet address (derived from `AGENT_PRIVATE_KEY`) and its BOT balance are shown on the **Dashboard** — top it up with **Fund gas** (~0.002 BOT) before running a cycle

No terminal, no setup. Just open the page and click.

### Via Standalone Script

```bash
cd agent
npm install
cp .env.example .env
# configure .env with your values
npm run once     # single cycle, exits after
npm start        # runs forever, checking periodically
```

## Environment Variables (`.env`)

| Variable | Required | Description |
|---|---|---|
| `RPC_URL` | ✅ | BOT Chain RPC (`https://rpc.botchain.ai`) |
| `CONTRACT_ADDRESS` | ⚠️ | Only needed for the **standalone script**. The web app can be pointed at any deployed contract via **Settings → Contract** in the UI (empty = default `0xcaE9…ddFe`). |
| `AGENT_PRIVATE_KEY` | ✅ | Agent wallet private key (gas only — fund it with a small amount of BOT) |
| `GEMINI_API_KEY` | ✅ | Free key from [Google AI Studio](https://aistudio.google.com/app/apikey) |

### How `.env` is loaded

A single `agent/.env` file powers both paths:

| Entry point | Loading mechanism |
|---|---|
| **API route** (`app/api/agent/route.ts`) | `dotenv.parse(readFileSync("agent/.env"))` — triggered when you click **Run Cycle** in the UI |
| **Standalone script** (`agent/agent.js`) | `import "dotenv/config"` — loaded at startup via `npm start` / `npm run once` |

Edit once, both work immediately.

## Output Example

As shown in the Agent UI log panel:

```
[2026-07-30T10:00:00.000Z] Checking all policies on-chain...
[2026-07-30T10:00:01.200Z] Gemini decision: { shouldRequest: true, reason: '...' }
[2026-07-30T10:00:01.300Z] Requesting execution for Policy #1: 0.6 BOT to 0x... (action: Transfer)...
[2026-07-30T10:00:03.900Z] ✅ APPROVED — 0.6 BOT sent. Remaining budget: 1.212 BOT.
```

## Important Notes

- **Agent wallet only needs BOT for gas.** The policy budget was already deposited on-chain when the policy was created. Never fund the agent wallet with the spending budget.
- **No `msg.value` sent.** The SafetyNet fee is already accounted for in the deposited budget (gross-up system). The agent just calls `executeRequest` with the exact amount from the policy.
- **Gemini is advisory only.** A "yes" from the model can still be rejected by the contract (e.g., budget depleted between decision and submission). This is expected behavior — the contract is the final authority.
- **No `POLICY_ID`, `DESTINATION`, or `ACTION_TYPE` in `.env`.** All execution parameters are read directly from the on-chain policy. The agent automatically discovers and evaluates every policy.
