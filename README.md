# Velora

**Delegate tasks, not your wallet.**

---

## 💡 The Problem: "The Trust-Delegation Paradox"

Current AI agents require full access to your assets to be useful. If you give an agent your private key, you risk everything (catastrophic loss). If you don't, the agent cannot perform actions on your behalf (crippled utility). There is no middle ground between **maximum utility** and **maximum security**.

## 🚀 The Solution: "On-Chain Guardrails"

Velora breaks this paradox by introducing **On-Chain Policy Enforcement**. You define granular, immutable rules in a Solidity smart contract (budget, destination, timing). The AI Agent is then granted the power to *propose* actions, but the Smart Contract acts as the ultimate gatekeeper, autonomously rejecting any request that violates your pre-defined rules. 

You no longer have to trust the AI's intent—you only have to trust the code.

---

## 🚀 Why Velora is Unique

*   **Trustless AI Execution:** We do not trust the AI. AI agents can hallucinate or be compromised; Velora uses Solidity smart contracts as an immutable judge that enforces spending limits, destinations, and timing rules regardless of AI decisions.
*   **Zero-Backend, Zero-Privilege Security:** 100% Client-to-Contract architecture. No servers, no exposed API keys, and no database. Your policies live purely on the blockchain, ensuring maximum transparency and security.
*   **Autonomous Agent Governance:** The built-in "Agent Control Panel" enables true on-chain automation, allowing agents to monitor and execute policies autonomously 24/7 without manual intervention.
*   **Rapid Simulation Mode:** A developer-first "Demo Mode" that allows toggling between production intervals (days) and testing intervals (seconds), perfect for showcasing full execution flows in seconds.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS, Framer Motion, Radix UI |
| **Smart Contract** | Solidity 0.8.24, OpenZeppelin Security |
| **Agent Logic** | Google Gemini (via client-side SDK) |
| **Blockchain** | BOT Chain (Ethers.js provider) |

---

## 🏗 Project Structure

```text
velora/
├── app/                # Next.js App Router (Dashboard, Create Policy, Simulation, Agent)
├── components/         # Modular UI (Landing, Dashboard, Agent Control, Create-Policy)
├── hooks/              # Smart contract interaction and wallet management
├── lib/                # Ethers provider and network utilities
├── contracts/          # Velora Solidity source and ABI
└── types/              # TS definitions mirrored from Solidity enums
```

---

## 🚀 Demo Script (Under 5 Minutes)

1.  **Connect & Create:** Connect MetaMask on the Dashboard. Click **Create Policy** → Define your rules (budget, destination, interval).
2.  **Enable Demo Mode:** In the "Limits" step, toggle **"Use seconds (Demo Mode)"** to allow for instant, rapid-fire simulations.
3.  **Autonomous Cycle:** Go to the **Agent Control Panel**. Toggle **"Auto-Run ON"**. Watch as the agent autonomously evaluates policies, fetches AI decisions, and submits transactions to the chain in real-time.
4.  **On-chain Validation:** Observe logs marked with 🚀, 📄, 💰, and ✅. Every single movement is confirmed by the smart contract's `ExecutionApproved` events.

---

## 🛡 Security Highlights

- **Checks-Effects-Interactions:** Implemented on all fund-transferring functions.
- **Reentrancy Protection:** `nonReentrant` modifiers on `executeRequest` and `withdrawRemainingBudget`.
- **Structurally Immutable:** Policies cannot be modified once deployed; only the agent can trigger allowed actions, and the contract holds the funds in escrow.
- **Machine-Readable Rejections:** Instead of silent failures, the contract emits specific `RejectReason` events for transparent debugging.
- **Velora SafetyNet:** An on-chain insurance pool for mitigation of unwanted execution risks. On Level 1, claims are capped at 70% of a policy's own historical contributions (partial refund pool), preventing self-dealing. *Roadmap v2: Oracle-verified claims (Level 2) and Multisig dispute window (Level 3).*

---

## 🚀 Getting Started

### 1. Contract Deployment
Deploy `contracts/Velora.sol` via [Remix IDE](https://remix.ethereum.org) on the BOT Chain. Copy the deployed address and update `contracts/addresses.ts`.

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000` and switch MetaMask to BOT Chain.
