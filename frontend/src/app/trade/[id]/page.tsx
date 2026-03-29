"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TokenIcon from "@/components/TokenIcon";
import { SignalBadge } from "@/components/SentimentBadge";
import { SentimentData, TradeResult } from "@/types";
import { fetchTokenSentiment, executeTrade } from "@/lib/api";

type TradeType = "buy" | "sell";

export default function TradePage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.id as string).toUpperCase();

  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [prices, setPrices] = useState<Record<string, { usd: number; change24h: number }> | null>(null);
  const [tradeType, setTradeType] = useState<TradeType>("buy");
  const [amountUsd, setAmountUsd] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [error, setError] = useState("");

  const price = prices?.[symbol]?.usd ?? 1;
  const tokenAmount = (amountUsd / price).toFixed(6);
  const gasFee = (amountUsd * 0.003).toFixed(2);
  const total = (amountUsd + parseFloat(gasFee)).toFixed(2);

  useEffect(() => {
    // Fetch sentiment
    fetchTokenSentiment(symbol)
      .then((d) => {
        setSentiment(d);
        setTradeType(d.signal === "SELL" ? "sell" : "buy");
      })
      .catch(() => {});

    // Fetch prices
    import("@/lib/api").then(api => api.fetchPrices()).then(setPrices).catch(() => {});
  }, [symbol]);

  async function handleExecute() {
    setLoading(true);
    setError("");
    try {
      const res = await executeTrade(symbol, amountUsd, tradeType);
      setResult(res);
    } catch (e: any) {
      setError(e.message ?? "Trade failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-5">⚡</div>
          <h2 className="text-[24px] font-bold text-green mb-3">
            Trade Executed!
          </h2>
          <p className="text-[14px] text-white/50 leading-relaxed mb-6">
            {tradeType.toUpperCase()} {result.tokenAmount} submitted via
            StarkZap on {result.network}.
          </p>

          {/* TX details */}
          <div className="bg-bg-2 border border-green/20 rounded-xl p-5 mb-6 text-left space-y-3">
            <Row label="Status" value="Confirmed ✓" valueClass="text-green" />
            <Row label="Symbol" value={result.symbol} />
            <Row label="Amount" value={`$${result.amountUsd}`} />
            <Row label="Token amount" value={result.tokenAmount ?? "—"} />
            <Row label="Network" value={result.network} />
            {result.txHash && (
              <div>
                <div className="text-[11px] text-white/30 uppercase tracking-widest mb-1">
                  TX Hash
                </div>
                <div className="font-mono text-[11px] text-white/50 break-all">
                  {result.txHash}
                </div>
              </div>
            )}
            {result.explorerUrl && (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[12px] text-accent-2 hover:underline mt-1"
              >
                View on Voyager Explorer ↗
              </a>
            )}
            {result.error && (
              <p className="text-[11px] text-yellow/70">{result.error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-3 rounded-xl border border-border-2 text-[14px] text-white/60 hover:text-white hover:border-white/30 transition-all"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-[14px] hover:bg-accent/90 transition-all"
            >
              New Trade
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Trade form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href={`/token/${symbol}`}
          className="flex items-center gap-1.5 text-[14px] text-white/40 hover:text-white mb-6 transition-colors w-fit"
        >
          ← Back to Analysis
        </Link>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[22px] font-bold tracking-tight mb-1">
            StarkZap Trade
          </h1>
          <p className="text-[13px] text-white/40">
            One-click execution on Starknet via StarkZap SDK
          </p>
        </div>

        <div className="bg-bg-2 border border-border rounded-xl p-6 space-y-5">
          {/* Token display */}
          <div>
            <Label>Token</Label>
            <div className="flex items-center gap-3 bg-bg-3 border border-border-2 rounded-lg px-4 py-2.5">
              <TokenIcon symbol={symbol} size="sm" />
              <span className="font-semibold">{symbol}</span>
              <span className="text-white/40 text-[13px] font-mono">
                ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Trade type */}
          <div>
            <Label>Trade Type</Label>
            <div className="flex gap-2">
              <TypeBtn
                active={tradeType === "buy"}
                type="buy"
                onClick={() => setTradeType("buy")}
              />
              <TypeBtn
                active={tradeType === "sell"}
                type="sell"
                onClick={() => setTradeType("sell")}
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label>Amount (USD)</Label>
            <input
              type="number"
              min={10}
              max={10000}
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value))}
              className="w-full bg-bg-3 border border-border-2 rounded-lg px-4 py-2.5 font-mono text-[15px] text-white outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Summary */}
          <div className="bg-bg-3 rounded-lg p-4 space-y-2.5 text-[13px]">
            <SummaryRow label="Amount" value={`$${amountUsd.toLocaleString()}`} />
            <SummaryRow label={`${symbol} amount`} value={`${tokenAmount} ${symbol}`} />
            <SummaryRow label="Gas (est.)" value={`$${gasFee}`} />
            <div className="border-t border-border pt-2.5 flex justify-between font-semibold">
              <span>Total</span>
              <span className="font-mono">${total}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-red bg-red-bg border border-red/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Execute */}
          <button
            onClick={handleExecute}
            disabled={loading || amountUsd < 10}
            className={`w-full py-4 rounded-xl font-bold text-[15px] tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              tradeType === "buy"
                ? "bg-green text-black hover:opacity-90"
                : "bg-red text-white hover:opacity-90"
            }`}
          >
            {loading ? "Submitting to Starknet…" : `⚡ Execute Zap ${tradeType.toUpperCase()}`}
          </button>

          <p className="text-center text-[11px] text-white/20">
            {process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
              ? "Testnet / simulated mode · No real funds used"
              : "Transactions execute on Starknet Sepolia"}
          </p>
        </div>

        {/* AI Recommendation (if loaded) */}
        {sentiment && (
          <div className="mt-4 bg-bg-2 border border-border rounded-xl p-5">
            <div className="text-[11px] text-white/30 uppercase tracking-widest mb-3">
              AI Recommendation
            </div>
            <div className="flex items-center gap-3 mb-2">
              <SignalBadge signal={sentiment.signal} />
              <span className="text-[13px] font-medium">{sentiment.recommendation}</span>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed">
              {sentiment.summary.split(".")[0]}.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-white/30 uppercase tracking-widest mb-2">
      {children}
    </div>
  );
}

function TypeBtn({
  active,
  type,
  onClick,
}: {
  active: boolean;
  type: "buy" | "sell";
  onClick: () => void;
}) {
  const activeClass =
    type === "buy"
      ? "bg-green-dim border-green text-green font-semibold"
      : "bg-red-bg border-red text-red font-semibold";
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-lg border text-[14px] transition-all duration-150 ${
        active ? activeClass : "border-border-2 text-white/40 hover:text-white hover:border-white/20 bg-bg-3"
      }`}
    >
      {type.toUpperCase()}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-white/40">{label}</span>
      <span className={`font-mono font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
