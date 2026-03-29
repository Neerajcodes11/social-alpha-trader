import Groq from "groq-sdk";
import { SentimentData, DashboardData } from "@/types";

const rawKey = process.env.GROQ_API_KEY;
const isPlaceholder = !rawKey || rawKey.startsWith("your_") || rawKey.includes("YOUR_");
const groq = !isPlaceholder ? new Groq({ apiKey: rawKey! }) : null;

const SUPPORTED = ["ETH", "BTC", "SOL"];

const TOKEN_NAMES: Record<string, string> = {
  ETH: "Ethereum",
  BTC: "Bitcoin",
  SOL: "Solana",
};

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  SOL: "solana",
};

// ── Mock sentiment results (fallback) ──
const MOCK_FALLBACK: Record<string, any> = {
  ETH: {
    token: "Ethereum", symbol: "ETH", sentiment: "positive", confidence: 78,
    bull_pct: 58, bear_pct: 22, neutral_pct: 20, mentions_analyzed: 120,
    summary: "Ethereum shows strong institutional demand following ETF inflows and Layer 2 ecosystem growth.",
    recommendation: "Enter ETH-USDC pool on Starknet via StarkZap",
    drivers: ["ETF inflows", "L2 expansion", "EIP upgrades", "DeFi TVL growth"],
    signal: "BUY", pool_suggestion: "ETH-USDC",
  },
  BTC: {
    token: "Bitcoin", symbol: "BTC", sentiment: "neutral", confidence: 55,
    bull_pct: 45, bear_pct: 35, neutral_pct: 20, mentions_analyzed: 98,
    summary: "Bitcoin is consolidating near key resistance levels as macro uncertainty creates short-term pressure.",
    recommendation: "Hold BTC position, await breakout confirmation",
    drivers: ["Macro headwinds", "Halving cycle", "Miner selloff", "ETF flows"],
    signal: "HOLD", pool_suggestion: "BTC-USDC",
  },
  SOL: {
    token: "Solana", symbol: "SOL", sentiment: "positive", confidence: 82,
    bull_pct: 65, bear_pct: 18, neutral_pct: 17, mentions_analyzed: 145,
    summary: "Solana momentum is driven by memecoin season and DePIN sector growth. Jupiter DEX volume is breaking records.",
    recommendation: "Enter SOL-USDC pool, high momentum signal",
    drivers: ["Memecoin season", "DePIN growth", "Jupiter DEX volume", "Network upgrades"],
    signal: "BUY", pool_suggestion: "SOL-USDC",
  },
};

// ── Prices Service ──
export async function getLivePrices() {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error("CG Failed");
    const json = await res.json();
    const prices: Record<string, { usd: number; change24h: number }> = {};
    for (const [symbol, cgId] of Object.entries(COINGECKO_IDS)) {
      const e = json[cgId];
      if (e) prices[symbol] = { usd: e.usd ?? 0, change24h: e.usd_24h_change ?? 0 };
    }
    return prices;
  } catch {
    return {
      ETH: { usd: 3450.2, change24h: 1.2 },
      BTC: { usd: 68200.5, change24h: -0.5 },
      SOL: { usd: 188.4, change24h: 4.8 },
    };
  }
}

// ── Sentiment Service ──
export async function getSentiment(symbol: string): Promise<SentimentData> {
  const currency = symbol.toLowerCase();
  const url = `https://cryptopanic.com/api/free/v1/posts/?currencies=${currency}&kind=news&public=true`;
  
  let titles: string[] = [];
  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    const json = await res.json();
    titles = (json.results ?? []).slice(0, 10).map((r: any) => r.title);
  } catch (e) {}

  if (!groq || titles.length === 0) return MOCK_FALLBACK[symbol] ?? MOCK_FALLBACK.ETH;

  const prompt = `Defi analyst. Analyze these titles for ${symbol} and return JSON: ${JSON.stringify(titles)}. Shape: {sentiment: "positive"|"negative"|"neutral", confidence: 0-100, summary: "2 sentences", signal: "BUY"|"SELL"|"HOLD", ...rest of standard SentimentData fields}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    return {
       ...MOCK_FALLBACK[symbol],
       ...JSON.parse(clean),
       symbol,
       token: TOKEN_NAMES[symbol]
    };
  } catch (err) {
    return MOCK_FALLBACK[symbol];
  }
}

// ── Dashboard Master Service (Used by page.tsx) ──
export async function getDashboardData(): Promise<DashboardData> {
  const [prices, sentiment] = await Promise.all([
    getLivePrices(),
    Promise.all(SUPPORTED.map(getSentiment))
  ]);
  return { prices, sentiment };
}
