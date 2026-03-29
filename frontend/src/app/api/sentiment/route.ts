import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const rawKey = process.env.GROQ_API_KEY;
const isPlaceholder = !rawKey || rawKey.startsWith("your_") || rawKey.includes("YOUR_");
const groq = !isPlaceholder ? new Groq({ apiKey: rawKey! }) : null;

const SUPPORTED = ["ETH", "BTC", "SOL"];

const TOKEN_NAMES: Record<string, string> = {
  ETH: "Ethereum",
  BTC: "Bitcoin",
  SOL: "Solana",
};

// ── Real news from CryptoPanic (free tier, no auth needed for public posts) ──
async function fetchRealHeadlines(symbol: string): Promise<string[]> {
  try {
    const currency = symbol.toLowerCase();
    const url = `https://cryptopanic.com/api/free/v1/posts/?currencies=${currency}&kind=news&public=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 120 } });

    if (!res.ok) throw new Error(`CryptoPanic ${res.status}`);
    const json = await res.json();

    const titles = (json.results ?? [])
      .slice(0, 15)
      .map((r: any) => r.title as string)
      .filter(Boolean);

    if (titles.length > 0) {
      console.log(`[Sentiment] Got ${titles.length} real headlines for ${symbol}`);
      return titles;
    }
    throw new Error("No results");
  } catch (err) {
    console.warn(`[Sentiment] CryptoPanic failed for ${symbol}, using mock:`, (err as Error).message);
    return MOCK_POSTS[symbol] ?? MOCK_POSTS.ETH;
  }
}

// ── Mock posts (fallback only) ──
const MOCK_POSTS: Record<string, string[]> = {
  ETH: [
    "ETH breaking out, L2 ecosystem booming, huge buy signal",
    "Ethereum staking yields up, institutional interest growing",
    "Bullish on ETH, EIP upgrades incoming, deflationary pressure",
    "ETH whale accumulation spotted on-chain",
    "Layer 2 TVL all time high, ETH is the base layer winner",
    "Selling ETH, macro uncertain, waiting for dip",
    "ETH looking neutral, consolidating near resistance",
    "Strong developer activity on Ethereum, long-term bullish",
  ],
  BTC: [
    "BTC halving cycle playing out, historically bullish",
    "BTC near key resistance, could dump or break out",
    "Macro headwinds weighing on BTC price action",
    "Miners selling post-halving, temporary pressure",
    "BTC ETF inflows slowing, demand uncertain",
    "Bitcoin consolidating, waiting for catalyst",
    "Institutional BTC buying continues quietly",
    "BTC chart looks like 2020 pre-rally setup",
  ],
  SOL: [
    "SOL meme season is back, network on fire",
    "Solana DePIN projects exploding, huge narrative",
    "Jupiter DEX volume smashing records on Solana",
    "SOL is outperforming ETH this cycle",
    "Some SOL network congestion but devs shipping fast",
    "Bullish on SOL, lower fees attract more users",
    "SOL breaking out of accumulation zone, load up",
    "Solana ecosystem has real users, not just speculation",
  ],
};

// ── Mock sentiment results (when no Groq key) ──
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

async function analyzeSentiment(symbol: string) {
  const posts = await fetchRealHeadlines(symbol);

  if (!groq) {
    console.warn("[Sentiment] No GROQ_API_KEY — returning mock for", symbol);
    return MOCK_FALLBACK[symbol];
  }

  const postsText = posts.map((p, i) => `${i + 1}. "${p}"`).join("\n");
  const tokenName = TOKEN_NAMES[symbol] ?? symbol;

  const prompt = `You are a DeFi sentiment analyst. Analyze these ${posts.length} social/news posts about ${symbol} and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Posts:
${postsText}

Return exactly this JSON shape:
{
  "token": "${tokenName}",
  "symbol": "${symbol}",
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <integer 0-100>,
  "bull_pct": <integer 0-100>,
  "bear_pct": <integer 0-100>,
  "neutral_pct": <integer 0-100>,
  "mentions_analyzed": ${posts.length},
  "summary": "<2 sentences about key sentiment drivers>",
  "recommendation": "<one action e.g. Enter ETH-USDC pool>",
  "drivers": ["<driver1>", "<driver2>", "<driver3>", "<driver4>"],
  "signal": "BUY" | "SELL" | "HOLD",
  "pool_suggestion": "<TOKEN-USDC>"
}

Rules: bull_pct + bear_pct + neutral_pct = 100. Base everything on the posts provided.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("[Sentiment] Groq error, fallback:", (err as Error).message);
    return MOCK_FALLBACK[symbol];
  }
}

// ── GET /api/sentiment ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get("symbol");

  if (symbolParam) {
    const symbol = symbolParam.toUpperCase();
    if (!SUPPORTED.includes(symbol)) {
      return NextResponse.json({ success: false, error: `Unsupported token. Supported: ${SUPPORTED.join(", ")}` }, { status: 400 });
    }
    const result = await analyzeSentiment(symbol);
    return NextResponse.json({ success: true, data: result });
  }

  // All tokens
  const results = await Promise.all(SUPPORTED.map((s) => analyzeSentiment(s)));
  return NextResponse.json({ success: true, data: results });
}
