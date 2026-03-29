/**
 * Price Service — Fetches live prices from CoinGecko API (free tier, no key needed)
 * Caches results for 30 seconds to stay within rate limits.
 */

interface PriceData {
  usd: number;
  usd_24h_change: number;
}

interface PriceCache {
  data: Record<string, PriceData>;
  fetchedAt: number;
}

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  SOL: "solana",
};

const CACHE_TTL = 30_000; // 30 seconds
let cache: PriceCache | null = null;

export async function getLivePrices(): Promise<Record<string, PriceData>> {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.data;
  }

  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[Price] CoinGecko returned ${res.status}, using fallback`);
      return getFallbackPrices();
    }

    const json = await res.json();

    // Map CoinGecko response → our symbol format
    const data: Record<string, PriceData> = {};
    for (const [symbol, cgId] of Object.entries(COINGECKO_IDS)) {
      const entry = json[cgId];
      if (entry) {
        data[symbol] = {
          usd: entry.usd ?? 0,
          usd_24h_change: entry.usd_24h_change ?? 0,
        };
      }
    }

    cache = { data, fetchedAt: Date.now() };
    console.log(`[Price] Live prices fetched: ${Object.entries(data).map(([s, d]) => `${s}=$${d.usd.toFixed(0)}`).join(", ")}`);
    return data;
  } catch (err) {
    console.warn("[Price] CoinGecko fetch failed, using fallback:", (err as Error).message);
    return getFallbackPrices();
  }
}

function getFallbackPrices(): Record<string, PriceData> {
  return {
    ETH: { usd: 3241.5, usd_24h_change: 2.34 },
    BTC: { usd: 67850.0, usd_24h_change: -0.87 },
    SOL: { usd: 185.4, usd_24h_change: 5.12 },
  };
}
