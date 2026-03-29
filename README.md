# Social Alpha Trader 🚀

AI-powered DeFi sentiment dashboard with one-click trade execution via **StarkZap SDK** on Starknet.

Built for the StarkZap hackathon challenge.

---

## 📺 Quick Demo
> [!TIP]
> **View the live dashboard at [social-alpha-trader.vercel.app](https://social-alpha-trader.vercel.app)** (Example link)
>
> 1. **Sentiment Grid**: See real-time Llama 3 analysis of crypto social signals.
> 2. **Deep Dive**: Click any token to see a detailed sentiment breakdown.
> 3. **Zap Trade**: Execute a one-click simulated trade on Starknet via StarkZap.
>
> **Demo Credentials (Judge Mode):**
> - **Email:** `judge@starkzap.com`
> - **Password:** `starkzap_demo`

---

## ✨ Features

| Feature | Details |
|---|---|
| **AI Sentiment Dashboard** | Groq (Llama 3 8B) analyzes social posts and scores ETH, BTC, SOL |
| **Sentiment Breakdown** | Bull / Bear / Neutral %, confidence score, market drivers |
| **One-Click Zap Trade** | StarkZap SDK executes real Starknet transactions |
| **Token Detail Page** | Deep-dive sentiment analysis per token |
| **Simulated Fallback** | Works without a private key — shows mock TX for demo |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS 3, TypeScript |
| Backend | Node.js, Express, TypeScript |
| AI | Groq SDK (Llama 3 8B model) |
| Blockchain | **StarkZap SDK** on Starknet (Sepolia testnet) |
| Deployment | Vercel (frontend) + any Node host (backend) |

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- Free [Groq API key](https://console.groq.com/keys)
- (Optional) Starknet Sepolia wallet + private key for live trades

### 2. Clone & Install

```bash
git clone https://github.com/your-username/social-alpha-trader
cd social-alpha-trader
npm run install-all
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Required for AI sentiment (free at console.groq.com/keys)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Starknet testnet config (optional — app works without this in simulation mode)
STARKNET_NETWORK=sepolia
STARKNET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
STARKNET_RECIPIENT_ADDRESS=0xYOUR_WALLET_ADDRESS

PORT=3001
```

```bash
cp frontend/.env.local.example frontend/.env.local
```

`frontend/.env.local` (defaults are fine for local dev):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run in Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001
- Health:   http://localhost:3001/api/health

### 5. Production Build

```bash
npm run build
npm run start:prod
```

---

## 🔑 StarkZap SDK Integration

The app uses [StarkZap](https://docs.starknet.io/build/starkzap/overview) — a TypeScript SDK for building consumer DeFi apps on Starknet.

### How it works (`backend/src/services/starkzap.service.ts`)

```ts
import { StarkZap, StarkSigner, Amount, fromAddress, getPresets } from "starkzap";

// 1. Init SDK on Sepolia testnet
const sdk = new StarkZap({ network: "sepolia" });

// 2. Connect wallet with private key signer
const wallet = await sdk.connectWallet({
  account: { signer: new StarkSigner(privateKey) },
});

// 3. Ensure account is deployed on-chain
await wallet.ensureReady({ deploy: "if_needed" });

// 4. Resolve token preset (STRK on testnet)
const token = getPresets(wallet.getChainId()).STRK;

// 5. Execute transfer
const tx = await wallet.transfer(token, [
  { to: fromAddress(recipientAddress), amount: Amount.parse("0.001", token) },
]);

await tx.wait();
console.log(tx.explorerUrl); // https://sepolia.voyager.online/tx/0x...
```

### Getting testnet tokens

1. Run the app and check the health endpoint for your wallet address
2. Visit [Starknet Sepolia Faucet](https://starknet-faucet.vercel.app/)
3. Paste your address and request STRK tokens
4. Trades will execute live on Sepolia

### Simulation mode

If `STARKNET_PRIVATE_KEY` is not set, the trade API returns a realistic mock transaction with a Voyager explorer URL. This is the default hackathon demo mode — no real funds required.

---

## 📡 API Reference

### `GET /api/health`

```json
{
  "status": "ok",
  "groq": true,
  "starknet": { "network": "sepolia", "signerConfigured": false }
}
```

### `GET /api/sentiment`

Returns sentiment analysis for ETH, BTC, SOL.

```json
{
  "success": true,
  "data": [
    {
      "token": "Ethereum",
      "symbol": "ETH",
      "sentiment": "positive",
      "confidence": 78,
      "bull_pct": 58,
      "bear_pct": 22,
      "neutral_pct": 20,
      "mentions_analyzed": 10,
      "summary": "...",
      "recommendation": "Enter ETH-USDC pool on Starknet",
      "drivers": ["ETF inflows", "L2 expansion", "..."],
      "signal": "BUY",
      "pool_suggestion": "ETH-USDC"
    }
  ]
}
```

### `GET /api/sentiment/:symbol`

Single token. `:symbol` = `ETH`, `BTC`, or `SOL`.

### `POST /api/trade`

```json
{
  "symbol": "ETH",
  "amountUsd": 500,
  "tradeType": "buy"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "txHash": "0xabc...",
    "explorerUrl": "https://sepolia.voyager.online/tx/0xabc...",
    "tokenAmount": "0.154321 ETH",
    "symbol": "ETH",
    "amountUsd": 500,
    "network": "sepolia"
  }
}
```

---

## 📁 Project Structure

```
social-alpha-trader/
│
├── frontend/                        # Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx             # Home — Sentiment Dashboard
│       │   ├── token/[id]/page.tsx  # Token Detail
│       │   └── trade/[id]/page.tsx  # Trade Execution
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── SentimentCard.tsx
│       │   ├── SentimentBadge.tsx
│       │   ├── TickerBar.tsx
│       │   └── TokenIcon.tsx
│       ├── lib/
│       │   └── api.ts               # API client
│       └── types/
│           └── index.ts             # Shared types
│
├── backend/                         # Express + TypeScript
│   └── src/
│       ├── index.ts                 # Server entry point
│       ├── routes/
│       │   ├── sentiment.route.ts
│       │   └── trade.route.ts
│       └── services/
│           ├── sentiment.service.ts # Groq / Llama 3
│           └── starkzap.service.ts  # StarkZap SDK
│
├── package.json                     # Root monorepo scripts
└── README.md
```

---

## 🔧 Extending the App

- **More tokens**: Add entries to `MOCK_SOCIAL_POSTS` and `MOCK_FALLBACK` in `sentiment.service.ts`
- **Real social data**: Replace the mock posts array with Twitter/Reddit API calls
- **AVNU Paymaster**: Add gasless transactions by following [StarkZap AVNU docs](https://docs.starknet.io/build/starkzap/integrations/avnu-paymaster)
- **Privy integration**: Replace `StarkSigner` with `OnboardStrategy.Privy` for social login

---

---

## 📁 Project Documentation
For a deep dive into the architecture, security, and future plans, check out the `docs/` folder:
- [Roadmap (MVP → Production)](./docs/roadmap.md)
- [Monetization & Cost Analysis](./docs/monetization_plan.md)
- [Security Hardening Plan](./docs/auth_security_plan.md)
- [Deployment Strategy](./docs/deployment_plan.md)
- [Technical Walkthrough](./docs/walkthrough.md)

---

## 📜 License
Built for the StarkZap hackathon challenge. MIT.
