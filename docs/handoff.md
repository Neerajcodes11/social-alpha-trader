# Handoff: Social Alpha Trader

## Project Overview
Social Alpha Trader is a crypto sentiment-to-trade app. It analyzes crypto social sentiment (via local AI) and allows users to execute trades via StarkZap.

## Current State
- **Backend (Node.js/Express):** 
  - Located in `/backend`.
  - Mock endpoints for `/api/sentiment` and `/api/trade` are implemented.
  - Dependencies: `express`, `cors`, `dotenv`.
- **Frontend (Next.js 15+):** 
  - Located in `/frontend`.
  - Initialized with App Router, TypeScript, Tailwind CSS, and ESLint.
  - Basic scaffolding complete.

## Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS.
- **Backend:** Node.js, Express.
- **AI:** Groq Cloud (Llama 3) via API.
- **Blockchain:** StarkZap (Integration currently mocked).

## Next Steps for AI Assistant
1.  **Sentiment Dashboard UI:** Build the Home page (`frontend/src/app/page.tsx`) with cards for ETH, BTC, and SOL showing sentiment scores and confidence (fetch from backend `/api/sentiment`).
2.  **Token Details Page:** Implement a dynamic route `/token/[id]` that displays a deeper sentiment breakdown and a recommendation.
3.  **One-Click Zap Trade:** 
    - Implement the `executeZapTrade()` function in the frontend.
    - It should call the backend `/api/trade` endpoint.
    - Show a "Processing" state and then a success message with the simulated transaction hash.
4.  **AI Integration:** Update the backend `sentiment` endpoint to use the `groq` SDK. It should query Llama 3 on Groq Cloud to analyze "social posts" (which can be hardcoded for now).
5.  **Design Polish:** Apply a "premium" DeFI aesthetic (dark mode, glassmorphism, nice typography).

## Local Development
- **Backend:** `cd backend && npm run dev` (starts on port 3001). Create a `.env` file with `GROQ_API_KEY`.
- **Frontend:** `cd frontend && npm run dev` (starts on port 3000)
- **Groq:** Get an API key from [Groq Console](https://console.groq.com/keys).
