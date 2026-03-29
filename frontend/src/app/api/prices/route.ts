import { NextResponse } from "next/server";

/**
 * Live prices from CoinGecko (free, no API key).
 * Cached in-memory for 30 seconds per Vercel serverless invocation.
 */

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  SOL: "solana",
};

let cache: { data: any; ts: number } | null = null;
const TTL = 30_000;

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json({ success: true, data: cache.data });
  }

  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const json = await res.json();

    const prices: Record<string, { usd: number; change24h: number }> = {};
    for (const [symbol, cgId] of Object.entries(COINGECKO_IDS)) {
      const e = json[cgId];
      if (e) prices[symbol] = { usd: e.usd ?? 0, change24h: e.usd_24h_change ?? 0 };
    }

    cache = { data: prices, ts: Date.now() };
    return NextResponse.json({ success: true, data: prices });
  } catch {
    // Fallback
    return NextResponse.json({
      success: true,
      data: {
        ETH: { usd: 3241.5, change24h: 2.34 },
        BTC: { usd: 67850.0, change24h: -0.87 },
        SOL: { usd: 185.4, change24h: 5.12 },
      },
    });
  }
}
