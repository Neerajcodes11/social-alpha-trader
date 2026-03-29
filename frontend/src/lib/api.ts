import { SentimentData, TradeResult, ApiResponse, DashboardData } from "@/types";

// For internal Next.js API routes, we need absolute URLs on the server.
function getBaseUrl() {
  // 1. If we're in the browser, always use a relative path
  if (typeof window !== "undefined") return ""; 
  
  // 2. If we're on Vercel's server, we need the full absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 3. Fallback for Local Dev
  return "http://localhost:3000";
}

const API_URL = getBaseUrl();

export async function fetchAllSentiment(): Promise<DashboardData> {
  const [sentRes, priceRes] = await Promise.all([
    fetch(`${API_URL}/api/sentiment`, { next: { revalidate: 60 } }),
    fetch(`${API_URL}/api/prices`, { next: { revalidate: 30 } })
  ]);
  
  const sentJson = await sentRes.json();
  const priceJson = await priceRes.json();
  
  if (!sentJson.success || !priceJson.success) throw new Error("Failed to fetch dashboard data");
  
  return {
    sentiment: sentJson.data,
    prices: priceJson.data
  };
}

export async function fetchTokenSentiment(symbol: string): Promise<SentimentData> {
  const res = await fetch(`${API_URL}/api/sentiment?symbol=${symbol}`, { next: { revalidate: 60 } });
  const json: ApiResponse<SentimentData> = await res.json();
  if (!json.success || !json.data) throw new Error(json.error ?? "Failed to fetch sentiment");
  return json.data;
}

export async function fetchPrices(): Promise<Record<string, { usd: number, change24h: number }>> {
  const res = await fetch(`${API_URL}/api/prices`, { next: { revalidate: 30 } });
  const json = await res.json();
  if (!json.success || !json.data) throw new Error("Failed to fetch prices");
  return json.data;
}

export async function executeTrade(
  symbol: string,
  amountUsd: number,
  tradeType: "buy" | "sell"
): Promise<TradeResult> {
  const res = await fetch(`${API_URL}/api/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, amountUsd, tradeType }),
  });
  const json: ApiResponse<TradeResult> = await res.json();
  if (!json.success || !json.data) throw new Error(json.error ?? "Trade failed");
  return json.data;
}
