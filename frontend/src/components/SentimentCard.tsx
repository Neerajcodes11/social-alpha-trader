"use client";
import Link from "next/link";
import { SentimentData } from "@/types";
import TokenIcon from "./TokenIcon";
import { SentimentBadge } from "./SentimentBadge";

function ConfidenceBar({
  value,
  sentiment,
}: {
  value: number;
  sentiment: string;
}) {
  const colors: Record<string, string> = {
    positive: "bg-green",
    negative: "bg-red",
    neutral: "bg-yellow",
  };
  const glowColors: Record<string, string> = {
    positive: "shadow-[0_0_8px_rgba(0,230,118,0.3)]",
    negative: "shadow-[0_0_8px_rgba(255,68,68,0.3)]",
    neutral: "shadow-[0_0_8px_rgba(255,214,0,0.3)]",
  };
  return (
    <div>
      <div className="flex justify-between text-[11px] text-white/40 mb-1.5">
        <span>AI Confidence</span>
        <span className="font-mono font-semibold text-white/70">{value}%</span>
      </div>
      <div className="h-1.5 bg-bg-4 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors[sentiment] ?? "bg-accent"} ${glowColors[sentiment] ?? ""}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function SentimentCard({ data, priceData }: { data: SentimentData; priceData: { usd: number; change24h: number } | undefined }) {
  const price = priceData?.usd ?? 0;
  const change = priceData?.change24h ?? 0;
  const isPos = change >= 0;

  const glowClass: Record<string, string> = {
    positive: "card-glow-green",
    negative: "card-glow-red",
    neutral: "card-glow-yellow",
  };

  return (
    <div
      className={`relative overflow-hidden glass-card border border-white/[0.06] rounded-2xl p-6 hover-lift cursor-pointer group ${glowClass[data.sentiment] ?? ""}`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/[0.03] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-3">
          <TokenIcon symbol={data.symbol} size="md" />
          <div>
            <div className="font-semibold text-[15px]">{data.token}</div>
            <div className="font-mono text-[12px] text-white/30">
              {data.symbol}/USD
            </div>
          </div>
        </div>
        <SentimentBadge sentiment={data.sentiment} />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2.5 mb-5 relative">
        <span className="font-mono font-bold text-[24px] tracking-tight">
          $
          {price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className={`font-mono text-[12px] font-semibold px-2 py-0.5 rounded-md ${isPos ? "text-green bg-green/10" : "text-red bg-red/10"}`}
        >
          {isPos ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-5 relative">
        <ConfidenceBar value={data.confidence} sentiment={data.sentiment} />
      </div>

      {/* Summary */}
      <p className="text-[12px] text-white/40 leading-relaxed mb-5 line-clamp-2 relative">
        {data.summary}
      </p>

      {/* Actions */}
      <div className="flex gap-2.5 relative">
        <Link
          href={`/token/${data.symbol}`}
          className="flex-1 text-center text-[12px] text-white/50 border border-white/[0.08] py-2.5 rounded-xl hover:bg-white/[0.04] hover:text-white hover:border-white/15 transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          Deep Dive →
        </Link>
        <Link
          href={`/trade/${data.symbol}`}
          className="flex-1 text-center text-[12px] font-semibold py-2.5 rounded-xl transition-all duration-200 bg-gradient-to-r from-accent to-accent/80 text-white hover:shadow-[0_4px_20px_rgba(108,99,255,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          ⚡ Zap Trade
        </Link>
      </div>
    </div>
  );
}

export function SentimentCardSkeleton() {
  return (
    <div className="relative overflow-hidden glass-card border border-white/[0.06] rounded-2xl p-6 card-glow-loading">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-bg" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded skeleton-bg" />
            <div className="h-3 w-14 rounded skeleton-bg" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-md skeleton-bg" />
      </div>
      <div className="h-7 w-36 rounded skeleton-bg mb-5" />
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between mb-1.5">
          <div className="h-3 w-24 rounded skeleton-bg" />
          <div className="h-3 w-8 rounded skeleton-bg" />
        </div>
        <div className="h-1.5 w-full rounded-full skeleton-bg" />
      </div>
      <div className="space-y-1.5 mb-5">
        <div className="h-3 w-full rounded skeleton-bg" />
        <div className="h-3 w-4/5 rounded skeleton-bg" />
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 h-10 rounded-xl skeleton-bg" />
        <div className="flex-1 h-10 rounded-xl skeleton-bg" />
      </div>
    </div>
  );
}
