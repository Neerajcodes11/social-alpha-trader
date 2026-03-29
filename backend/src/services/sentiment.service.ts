import Groq from "groq-sdk";

const rawKey = process.env.GROQ_API_KEY;
const isPlaceholder = !rawKey || rawKey.startsWith("your_") || rawKey.includes("YOUR_");

const groq = !isPlaceholder
  ? new Groq({ apiKey: rawKey! })
  : null;

export interface SentimentResult {
  token: string;
  symbol: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  bull_pct: number;
  bear_pct: number;
  neutral_pct: number;
  mentions_analyzed: number;
  summary: string;
  recommendation: string;
  drivers: string[];
  signal: "BUY" | "SELL" | "HOLD";
  pool_suggestion: string;
}

// Mock social posts for demo — in production, plug in Twitter/Reddit API
const MOCK_SOCIAL_POSTS: Record<string, string[]> = {
  ETH: [
    "ETH breaking out, L2 ecosystem booming, huge buy signal",
    "Ethereum staking yields up, institutional interest growing",
    "ETH/USDC pool APY is looking attractive right now",
    "Bullish on ETH, EIP upgrades incoming, deflationary pressure",
    "ETH whale accumulation spotted on-chain",
    "Layer 2 TVL all time high, ETH is the base layer winner",
    "Selling ETH, macro uncertain, waiting for dip",
    "ETH looking neutral, consolidating near resistance",
    "Strong developer activity on Ethereum, long-term bullish",
    "ETH gas fees down, more accessible for retail",
  ],
  BTC: [
    "BTC halving cycle playing out, historically bullish",
    "Bitcoin dominance rising, altcoins losing ground",
    "BTC near key resistance, could dump or break out",
    "Macro headwinds weighing on BTC price action",
    "Miners selling post-halving, temporary pressure",
    "BTC ETF inflows slowing, demand uncertain",
    "Long term BTC hodl strategy unchanged",
    "Bitcoin consolidating, waiting for catalyst",
    "Institutional BTC buying continues quietly",
    "BTC chart looks like 2020 pre-rally setup",
  ],
  SOL: [
    "SOL meme season is back, network on fire",
    "Solana DePIN projects exploding, huge narrative",
    "Jupiter DEX volume smashing records on Solana",
    "SOL/USDC pool giving insane yields this week",
    "Solana validator count growing, more decentralized",
    "SOL is outperforming ETH this cycle",
    "Solana ecosystem has real users, not just speculation",
    "Some SOL network congestion but devs shipping fast",
    "Bullish on SOL, lower fees attract more users",
    "SOL breaking out of accumulation zone, load up",
  ],
};

const MOCK_FALLBACK: Record<string, SentimentResult> = {
  ETH: {
    token: "Ethereum",
    symbol: "ETH",
    sentiment: "positive",
    confidence: 78,
    bull_pct: 58,
    bear_pct: 22,
    neutral_pct: 20,
    mentions_analyzed: 120,
    summary:
      "Ethereum shows strong institutional demand following ETF inflows and Layer 2 ecosystem growth. Developer activity remains near all-time highs with multiple EIPs in progress.",
    recommendation: "Enter ETH-USDC pool on Starknet via StarkZap",
    drivers: [
      "ETF inflows",
      "L2 expansion",
      "EIP upgrades",
      "DeFi TVL growth",
    ],
    signal: "BUY",
    pool_suggestion: "ETH-USDC",
  },
  BTC: {
    token: "Bitcoin",
    symbol: "BTC",
    sentiment: "neutral",
    confidence: 55,
    bull_pct: 45,
    bear_pct: 35,
    neutral_pct: 20,
    mentions_analyzed: 98,
    summary:
      "Bitcoin is consolidating near key resistance levels as macro uncertainty and miner selling create short-term pressure. Long-term halving cycle dynamics remain constructive.",
    recommendation: "Hold BTC position, await breakout confirmation",
    drivers: [
      "Macro headwinds",
      "Halving cycle",
      "Miner selloff",
      "ETF flows",
    ],
    signal: "HOLD",
    pool_suggestion: "BTC-USDC",
  },
  SOL: {
    token: "Solana",
    symbol: "SOL",
    sentiment: "positive",
    confidence: 82,
    bull_pct: 65,
    bear_pct: 18,
    neutral_pct: 17,
    mentions_analyzed: 145,
    summary:
      "Solana momentum is driven by memecoin season and DePIN sector growth. Jupiter DEX volume is breaking records and network performance improvements are attracting new developer mindshare.",
    recommendation: "Enter SOL-USDC pool, high momentum signal",
    drivers: [
      "Memecoin season",
      "DePIN growth",
      "Jupiter DEX volume",
      "Network upgrades",
    ],
    signal: "BUY",
    pool_suggestion: "SOL-USDC",
  },
};

export async function analyzeSentiment(
  symbol: string
): Promise<SentimentResult> {
  const posts = MOCK_SOCIAL_POSTS[symbol];
  if (!posts) throw new Error(`Unknown token: ${symbol}`);

  if (!groq) {
    console.warn("No GROQ_API_KEY — returning mock sentiment for", symbol);
    return MOCK_FALLBACK[symbol];
  }

  const postsText = posts.map((p, i) => `${i + 1}. "${p}"`).join("\n");

  const prompt = `You are a DeFi sentiment analyst. Analyze these ${posts.length} social media posts about ${symbol} and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Posts:
${postsText}

Return exactly this JSON shape:
{
  "token": "${symbol === "ETH" ? "Ethereum" : symbol === "BTC" ? "Bitcoin" : "Solana"}",
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
    const parsed = JSON.parse(clean) as SentimentResult;
    return parsed;
  } catch (err) {
    console.error("Groq error, falling back to mock:", err);
    return MOCK_FALLBACK[symbol];
  }
}
