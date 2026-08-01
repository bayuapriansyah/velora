# Velora

**Delegate tasks, not your wallet.**

Trust-minimized AI agent execution on BOT Chain — create on-chain policies, deploy autonomous agents, and stay in full control.

> Built for the **BOTChain Build Week** Hackathon

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [System Architecture](#-system-architecture)
- [Policy Execution Flow](#-policy-execution-flow)
- [Contract Decision Tree](#-contract-decision-tree)
- [Core Features](#-core-features)
- [Live Deployment](#-live-deployment)
- [Repository Structure](#-repository-structure)
- [Getting Started (User)](#-getting-started-user)
- [Getting Started (Developer)](#-getting-started-developer)
- [Smart Contract](#-smart-contract)
- [Security](#-security)
- [Team](#-team)
- [References](#-references)

---

## ❌ The Problem

AI agents can reason and act, but they cannot be fully trusted. Current approaches force a dangerous choice:

| Approach | Risk |
|---|---|
| Give agent full wallet access | One mistake = catastrophic loss |
| Give agent no access | Agent cannot execute anything useful |
| Use API keys + proxy | Server compromise leaks credentials |

There is no middle ground between **utility** and **security** for autonomous AI agents.

---

## ✅ The Solution

Velora introduces **on-chain policy enforcement**. You define granular, immutable rules in a Solidity smart contract — budget, destination, amount, timing, execution limits. The AI agent can only *propose* actions; the smart contract is the sole authority that approves or rejects every request.

**You no longer trust the AI. You trust the code.**

### Key principles

- **AI-powered agent** — uses Google Gemini for execution decisions
- **Server-side agent** — a small API route hosts the agent's gas wallet and Gemini key; your personal wallet is never touched by the server
- **Gross-up fee** — SafetyNet fee (1%) included in pre-funded deposit, agent never needs `msg.value`
- **Policy SafetyNet** — on-chain insurance pool, policy owners can claim compensation

---

## 🏛️ System Architecture

```mermaid
flowchart LR
    subgraph User
        W[Wallet MetaMask]
        UI[Browser / Frontend]
    end

    subgraph Server
        API[API Route /api/agent<br/>Next.js on Netlify]
    end

    subgraph "BOT Chain"
        C[Velora Smart Contract<br/>Chain ID 677]
    end

    subgraph "AI"
        LLM[Google Gemini]
    end

    subgraph "Standalone"
        S[agent/agent.js<br/>npm start / npm run once]
    end

    W -->|Connect| UI
    UI -->|Create Policy + Deposit| C
    UI -->|Click Run Cycle| API
    API -->|getPolicy / getPoliciesByOwner| C
    API -->|askGemini| LLM
    API -->|executeRequest| C
    S -->|getPolicy| C
    S -->|askGemini| LLM
    S -->|executeRequest| C
    C -->|Event: ExecutionApproved / ExecutionRejected| UI
```

---

## 🔄 Policy Execution Flow

```mermaid
sequenceDiagram
    participant U as User / UI
    participant C as Velora Smart Contract
    participant A as Agent
    participant G as Gemini

    U->>C: createPolicy(name, dest, amount, interval, maxExec)
    Note over C: Validate + deposit (amount + fee) × maxExec
    C-->>U: Policy ID
    
    loop Every cycle (auto-run or manual)
        A->>C: getPolicy(policyId)
        Note over A: Check Active + due?
        
        alt Not active or not due
            A->>A: Skip (log reason)
        else Active + due
            A->>G: should I execute? Prompt with policy state
            G-->>A: { shouldRequest, reasoning }
            
            alt shouldRequest = false
                A->>A: Skip (Gemini says no)
            else shouldRequest = true
                A->>C: getPolicy(policyId) [re-check]
                Note over A: Compare executionCount & status
                
                alt Changed by another cycle
                    A->>A: Skip (race condition avoided)
                else Still unchanged
                    A->>C: executeRequest(policyId, amount, dest, action)
                    
                    alt Approved
                        C-->>A: ExecutionApproved ✅
                        Note over C: Debit remainingBudget<br/>Fee → SafetyNet pool
                    else Rejected
                        C-->>A: ExecutionRejected ❌
                        Note over C: Emit RejectReason<br/>(Expired, Budget, Interval, etc.)
                    end
                end
            end
        end
    end
    
    U->>C: withdrawRemainingBudget(policyId)
    Note over C: Policy inactive → refund owner
    C-->>U: Budget withdrawn
```

---

## 🌲 Contract Decision Tree (`executeRequest`)

```mermaid
flowchart TD
    A[executeRequest called] --> B{Policy exists?}
    B -->|No| R1["❌ Revert: PolicyNotFound"]
    B -->|Yes| C{Effective status?}
    C -->|Expired| R2["❌ Reject: Expired<br/>(auto-set status)"]
    C -->|Cancelled| R3["❌ Reject: NotActive"]
    C -->|Exhausted| R3
    C -->|Active| D{Destination matches?}
    D -->|No| R4["❌ Reject: DestinationMismatch"]
    D -->|Yes| E{Action matches?}
    E -->|No| R5["❌ Reject: ActionMismatch"]
    E -->|Yes| F{Amount == amountPerExecution?}
    F -->|No| R6["❌ Reject: InvalidExecutionAmount"]
    F -->|Yes| G{Interval elapsed?}
    G -->|No| R7["❌ Reject: PaymentNotDue"]
    G -->|Yes| H{Budget ≥ amount + fee?}
    H -->|No| R8["❌ Reject: InsufficientBudget"]
    H -->|Yes| I{execCount < maxExec?}
    I -->|No| R9["❌ Reject: ExecutionLimitReached<br/>(auto-set Exhausted)"]
    I -->|Yes| J["✅ Approved"]
    J --> K[Debit totalCost = amount + fee]
    K --> L[Increment executionCount]
    L --> M[Update lastExecutionTime]
    M --> N[Emit ExecutionApproved]
    N --> O[Send amount to destination]
    O --> P[Add fee to SafetyNet pool]
```

---

## 🧩 Core Features

| Layer | Feature | Status |
|---|---|---|
| **Policy Creation** | Multi-step wizard (name, destination, action, limits, review) | ✅ Live |
| **On-Chain Rules** | 7 immutable reject reasons enforced by contract | ✅ Live |
| **Frontend Simulation** | Animated rule timeline + real `executeRequest` transaction | ✅ Live |
| **Autonomous Agent** | AI-powered (Gemini), runs via UI click or standalone script | ✅ Live |
| **Gross-up Fee** | 1% SafetyNet fee included in pre-funded deposit, no `msg.value` | ✅ Live |
| **SafetyNet Pool** | On-chain insurance — claim up to 70% of policy's contributions | ✅ Live |
| **Race Protection** | Re-check on-chain before submit — prevents double-execution | ✅ Live |
| **Demo Mode** | Toggle seconds instead of days for rapid testing | ✅ Live |
| **Contract Verification** | Source code verified on BOTScan | ✅ Live |

---

## 🌐 Live Deployment

| Asset | Link |
|---|---|
| **Web App** | https://velora-policies.netlify.app |
| **Chain** | BOT Chain Mainnet (Chain ID 677) |
| **Contract** | `0xcaE9f3569486094b86Fc8b85024050B58815ddFe` — [View on BOTScan](https://scan.botchain.ai/address/0xcaE9f3569486094b86Fc8b85024050B58815ddFe) |
| **Repository** | https://github.com/bayuapriansyah/velora |
| **X Post** | TBD — replace with your post URL |

---

## 📂 Repository Structure

```
velora/
├── app/
│   ├── api/agent/           # POST /api/agent — AI agent execution cycle
│   │                        # GET  /api/agent/status — agent wallet + gas balance
│   ├── create-policy/        # Multi-step policy creation wizard (4 steps)
│   ├── dashboard/            # Policy table, SafetyNet stats, analytics
│   ├── simulation/           # Rule simulation + live on-chain execution
│   ├── agent/                # Agent control panel (Run Cycle, logs, auto-run)
│   └── policies/             # Full policy list + cancel/withdraw
├── components/               # UI grouped by page + Radix primitives
├── contracts/
│   ├── Velora.sol            # Solidity smart contract (source)
│   ├── Velora.abi.json       # Hand-maintained ABI for frontend
│   └── addresses.ts          # Contract address per chain ID
├── hooks/                    # useWallet, useVeloraContract, usePolicies, usePolicyEvents
├── lib/                      # ethers.ts, network.ts, format.ts, velora-address.ts
├── types/                    # policy.ts (enums mirroring Solidity)
├── utils/                    # validation.ts — client-side prediction mirroring contract logic
├── netlify.toml              # Netlify deploy config (Next.js plugin)
└── agent/                    # Standalone agent script (agent.js) + env
```

---

## 🚀 Getting Started (User)

1. Open the Velora web app
2. Connect MetaMask — switch to BOT Chain Mainnet
3. Click **Create Policy** → fill in name, destination, amount, interval, max executions
4. Review + sign the transaction (one gas fee)
5. Open **Dashboard** → click **Fund gas** on the agent wallet card (~0.002 BOT) so the agent can pay transaction fees
6. Navigate to **Agent** → click **Run Cycle**
7. Watch the agent evaluate policies, ask Gemini, and submit execution requests
8. Check **Dashboard** for remaining budget, execution count, and SafetyNet stats

> **Optional:** point the app at a different Velora deployment via **Settings → Contract** in the sidebar.

---

## 🚀 Getting Started (Developer)

### Prerequisites
- Node.js ≥ 18
- MetaMask with BOT Chain Mainnet added

### Local setup

```bash
git clone https://github.com/your-org/velora.git
cd velora
npm install
cp agent/.env.example agent/.env
# fill in: RPC_URL=https://rpc.botchain.ai, AGENT_PRIVATE_KEY, GEMINI_API_KEY
# CONTRACT_ADDRESS is optional — falls back to the deployed 0xcaE9…ddFe, or users
# can set their own via Settings → Contract in the UI.
npm run dev
```

Open `http://localhost:3000`.

### Commands

| Command | Action |
|---|---|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint via next lint |

### Standalone agent

```bash
cd agent
npm install
# .env already configured
npm run once      # single decision cycle
npm start         # loop forever
```

---

## 🔐 Smart Contract

`Velora.sol` — deployed on BOT Chain Mainnet. Verified on BOTScan.

### Constructor parameters

| Parameter | Value | Description |
|---|---|---|
| `_safetyNetFeeBps` | `100` (1%) | Fee per execution added to SafetyNet pool |
| `_minFeeThreshold` | `100000000000000` (0.0001 BOT) | Minimum amount for fee to apply |
| `_claimCooldown` | `30` (30 seconds) | Cooldown between claims |
| `_maxClaimPerTx` | `10000000000000000` (0.01 BOT) | Max amount per claim transaction |

### Public functions

| Function | Description |
|---|---|
| `createPolicy` | Create policy + deposit budget (payable) |
| `executeRequest` | Execute or reject based on policy rules |
| `cancelPolicy` | Cancel policy (owner only) |
| `withdrawRemainingBudget` | Withdraw remaining budget (inactive policies) |
| `seedSafetyNet` | Anyone can seed the pool (payable) |
| `claimFromSafetyNet` | Claim compensation from pool (owner only) |

### Custom errors

All revert reasons use Solidity custom errors for gas efficiency:
`PolicyNotFound`, `NotPolicyOwner`, `ZeroDeposit`, `InvalidExpiration`, `InvalidDestination`, `InvalidMaxExecutions`, `InvalidAmountPerExecution`, `InvalidPaymentInterval`, `BudgetTooSmall`, `PolicyNotActive`, `NothingToWithdraw`, `WithdrawTransferFailed`, `ReentrantCall`

---

## 🛡 Security

- **Checks-Effects-Interactions** pattern on all fund-transferring functions
- **Reentrancy protection** (`nonReentrant`) on `executeRequest`, `claimFromSafetyNet`, and `withdrawRemainingBudget`
- **Custom errors** instead of `require` strings — lower gas, consistent pattern
- **7 on-chain reject reasons** with machine-readable events — no silent failures
- **Pre-flight re-check** — agent re-fetches policy state before submitting to avoid race conditions
- **Gross-up fee** — agent never sends `msg.value`, reducing attack surface
- **No admin key** — contract has no owner, no upgrade mechanism, no backdoor
- **Server secrets, scoped** — the server only holds the agent's gas wallet key + Gemini key; your personal wallet never leaves your browser

---

## 👥 Team

Built for the **BOTChain Build Week** Hackathon by:

- **Your Name** — Full-stack developer

---

## 📚 References

- [BOT Chain Developer Docs](https://dev-docs.botchain.ai)
- [BOTScan Explorer](https://scan.botchain.ai)
- [BOT Chain Faucet](https://faucet.botchain.ai/basic)
- [Remix IDE](https://remix.ethereum.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [ethers.js v6](https://docs.ethers.org)
- [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey)

---

## 📄 License

MIT

---

*Velora · Built for BOTChain Build Week · Delegate tasks, not your wallet.*
