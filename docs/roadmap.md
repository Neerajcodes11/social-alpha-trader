# Product Roadmap: Social Alpha Trader (MVP → Production)

This document outlines the strategic steps to transform the current hackathon MVP into a secure, scalable, and real-world-ready DeFi application.

---

## 🏗️ 1. Technical Foundation (Hardening)

| Milestone | Action Items |
|---|---|
| **Database Migration** | Replace the `users.json` file with a managed database like **PostgreSQL** (Supabase) or **MongoDB Atlas** for ACID compliance and scalability. |
| **Identity Management** | Replace custom JWT auth with a production-grade provider like **Clerk**, **Auth0**, or **Supabase Auth** to handle MFA, social logins, and secure session management. |
| **Secret Management** | Move all API keys and Private Keys to a dedicated vault (e.g., **AWS Secrets Manager** or **Railway Variables**) instead of standard `.env` files. |
| **API Architecture** | Refactor the backend into a modular structure (e.g., Controllers, Services, Repositories) for easier testing and maintenance. |

---

## 📈 2. AI & Data Fidelity

### From Mocks to Markets
*   **Real Social Streams**: Integrate the **Twitter (X) API v2** and **Reddit API** to replace the `MOCK_SOCIAL_POSTS` in `sentiment.service.ts`.
*   **Advanced Agentic Analysis**: Upgrade from a single sentiment score to an agentic workflow that analyzes:
    *   On-chain whale movements (via DexScreener/Defined.fi API).
    *   Developer activity (GitHub API).
    *   Macro News (CryptoPanic API).
*   **Fine-tuning**: Fine-tune a Llama 3 model specifically on crypto-financial data for higher accuracy.

---

## ⛓️ 3. The Blockchain Layer (StarkZap & Beyond)

### The StarkZap Question
> [!IMPORTANT]
> **Should you replace StarkZap?**
> - **Keep it if:** You prioritize a seamless, frictionless "One-Click" experience for consumer users. StarkZap handles account abstraction and simple transfers better than almost anyone.
> - **Replace/Supplement if:** You want to offer complex DeFi strategies like multi-hop swaps, concentrated liquidity provision (Ekubo), or cross-chain zaps.

### Alternatives to StarkZap
| Alternative | Best For |
|---|---|
| **Starknet.js** | The absolute "gold standard" for Starknet. Use this if you want total control over contract interactions and custom transactions. |
| **AVNU SDK** | The best for aggregator swaps in the Starknet ecosystem. Essential if your "Zap" needs to involve a token swap. |
| **Braavos/Argent SDKs** | Use these if you want to integrate directly with the most popular browser wallets on Starknet. |
| **Dynamic / Privy** | If you want to move beyond just Starknet, these "wallet-as-a-service" providers support cross-chain social logins. |

---

## 🚀 4. Shipping Strategy

### Phase A: Private Beta (Q1)
*   Deploy to **Sepolia Testnet** with a waitlist.
*   Implement a **Points/Leaderboard system** to reward early sentiment contributors.
*   Social sharing: "I just zapped $ETH based on AI signals 🚀"

### Phase B: Mainnet Launch (Q2)
*   **Security Audit**: Mandatory 3rd-party audit of the `starkzap.service` and any custom smart contracts.
*   **Risk Guardrails**: Implement maximum trade sizes ($50 - $100) per transaction during the initial launch phase.
*   **Analytics**: Integrate PostHog or Mixpanel for tracking user conversion from "Sentiment View" to "Successful Trade."

---

## 📜 5. Conclusion
The "Social Alpha Trader" has a strong value proposition: **Closing the gap between Social Intelligence and On-Chain Execution.** 

By hardening the infrastructure and moving from mock data to real-time streams, this project can become a premiere "Sentiment-to-Trade" terminal for the Starknet ecosystem.
