import { fetchTokenSentiment } from "@/lib/api";
import { SentimentData } from "@/types";
import Navbar from "@/components/Navbar";
import TokenIcon from "@/components/TokenIcon";
import { SentimentBadge, SignalBadge } from "@/components/SentimentBadge";
import Link from "next/link";
import { notFound } from "next/navigation";

const SUPPORTED = ["ETH", "BTC", "SOL"];

export async function generateStaticParams() {
  return SUPPORTED.map((id) => ({ id }));
}

function BreakdownBar({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="w-16 text-white/50 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-4 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-[12px] font-semibold w-10 text-right ${color.replace("bg-", "text-")}`}>
        {pct}%
      </span>
    </div>
  );
}

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const symbol = id.toUpperCase();

  if (!SUPPORTED.includes(symbol)) notFound();

  let data;
  let prices;
  try {
    const [sent, prs] = await Promise.all([
      fetchTokenSentiment(symbol),
      import("@/lib/api").then(api => api.fetchPrices())
    ]);
    data = sent;
    prices = prs;
  } catch {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <Link href="/" className="text-white/40 text-sm hover:text-white mb-6 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="text-center py-16 text-white/40">
            <p>Failed to load data for {symbol}.</p>
          </div>
        </main>
      </div>
    );
  }

  const priceData = prices[symbol];
  const price = priceData?.usd ?? 0;
  const change = priceData?.change24h ?? 0;
  const isPos = change >= 0;

  const sentimentColor: Record<string, string> = {
    positive: "text-green",
    negative: "text-red",
    neutral: "text-yellow",
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[14px] text-white/40 hover:text-white mb-6 transition-colors w-fit"
        >
          ← Back to Dashboard
        </Link>

        {/* Hero card */}
        <div className="bg-bg-2 border border-border rounded-xl p-6 mb-5">
          {/* Token header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <TokenIcon symbol={symbol} size="lg" />
              <div>
                <h1 className="text-[22px] font-bold tracking-tight">{data.token}</h1>
                <p className="font-mono text-[14px] text-white/40">{symbol} / USD</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[28px]">
                ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span
                className={`font-mono text-[13px] font-semibold px-2 py-0.5 rounded mt-1 inline-block ${isPos ? "text-green bg-green/10" : "text-red bg-red/10"}`}
              >
                {isPos ? "+" : ""}
                {change.toFixed(2)}% 24h
              </span>
            </div>
          </div>

          {/* Sentiment section */}
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-5 items-start">
            {/* Score box */}
            <div className="bg-bg-3 rounded-xl p-4 text-center">
              <div
                className={`text-[40px] font-bold font-mono ${sentimentColor[data.sentiment] ?? "text-white"}`}
              >
                {data.confidence}
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                Confidence %
              </div>
              <div className="mt-3">
                <SentimentBadge sentiment={data.sentiment} />
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <BreakdownBar label="Bullish" pct={data.bull_pct} color="bg-green" />
              <BreakdownBar label="Bearish" pct={data.bear_pct} color="bg-red" />
              <BreakdownBar label="Neutral" pct={data.neutral_pct} color="bg-yellow" />
              <p className="text-[13px] text-white/50 leading-relaxed pt-1">
                {data.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-bg-2 border border-border rounded-xl p-4">
            <div className="text-[11px] text-white/30 uppercase tracking-widest mb-2">
              Mentions
            </div>
            <div className="font-mono font-bold text-[22px]">
              {data.mentions_analyzed}
            </div>
            <div className="text-[11px] text-white/30 mt-1">posts analyzed</div>
          </div>
          <div className="bg-bg-2 border border-border rounded-xl p-4">
            <div className="text-[11px] text-white/30 uppercase tracking-widest mb-2">
              AI Signal
            </div>
            <div className="mt-1">
              <SignalBadge signal={data.signal} />
            </div>
            <div className="text-[11px] text-white/30 mt-2">social + market</div>
          </div>
          <div className="bg-bg-2 border border-border rounded-xl p-4 col-span-2">
            <div className="text-[11px] text-white/30 uppercase tracking-widest mb-2">
              Recommendation
            </div>
            <div className="text-[14px] font-medium leading-snug">
              {data.recommendation}
            </div>
            <div className="text-[11px] text-white/30 mt-1">
              Pool: {data.pool_suggestion}
            </div>
          </div>
        </div>

        {/* Drivers */}
        <div className="bg-bg-2 border border-border rounded-xl p-5 mb-5">
          <div className="text-[11px] text-white/30 uppercase tracking-widest mb-3">
            Market Drivers
          </div>
          <div className="flex flex-wrap gap-2">
            {data.drivers.map((d: string) => (
              <span
                key={d}
                className="bg-bg-4 border border-border-2 px-3 py-1.5 rounded-lg text-[12px] text-white/60"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/trade/${symbol}`}
          className="block w-full text-center py-4 rounded-xl font-bold text-[15px] tracking-wide bg-accent text-white hover:bg-accent/90 transition-all duration-150"
        >
          ⚡ Execute Zap Trade on Starknet
        </Link>
      </main>
    </div>
  );
}
