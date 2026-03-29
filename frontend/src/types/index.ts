export interface SentimentData {
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

export interface TradeResult {
  success: boolean;
  txHash?: string;
  explorerUrl?: string;
  tokenAmount?: string;
  symbol: string;
  amountUsd: number;
  network: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}


export interface DashboardData {
  sentiment: SentimentData[];
  prices: Record<string, { usd: number; change24h: number }>;
}
