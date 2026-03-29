import { fetchAllSentiment } from "@/lib/api";
import { SentimentData, DashboardData } from "@/types";
import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import SentimentCard, { SentimentCardSkeleton } from "@/components/SentimentCard";
import { Suspense } from "react";

async function SentimentGrid() {
  let dashboard: DashboardData | null = null;
  let error = "";

  try {
    dashboard = await fetchAllSentiment();
  } catch (e: any) {
    error = e.message ?? "Failed to load sentiment data";
  }

  if (error || !dashboard) {
    return (
      <div className="col-span-full text-center py-24">
        <div className="inline-flex flex-col items-center glass-card border border-border rounded-2xl px-12 py-10">
          <div className="text-4xl mb-4 opacity-60">⚠️</div>
          <p className="text-lg font-medium mb-2 text-white/60">Backend unavailable</p>
          <p className="text-sm text-white/30 max-w-sm">{error}</p>
          <code className="mt-4 text-xs font-mono bg-bg-3 px-3 py-1.5 rounded-lg text-accent-2 border border-border">
            npm run dev
          </code>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="col-span-full">
        <TickerBar prices={dashboard.prices} />
      </div>
      {dashboard.sentiment.map((d, i) => (
        <div key={d.symbol} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>
          <SentimentCard data={d} priceData={dashboard!.prices[d.symbol]} />
        </div>
      ))}
    </>
  );
}

function SkeletonGrid() {
  return (
    <>
      <SentimentCardSkeleton />
      <SentimentCardSkeleton />
      <SentimentCardSkeleton />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col relative">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:px-10 py-10 relative z-10">
        {/* Header */}
        <div className="mb-10 pl-2 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accent to-green" />
            <h1 className="text-[36px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
              Sentiment Dashboard
            </h1>
          </div>
          <p className="text-[15px] text-white/35 max-w-xl leading-relaxed">
            Real-time AI analysis of crypto social signals. Converting market sentiment into 
            instant liquidity via <span className="text-accent-2 font-medium">StarkZap</span>.
          </p>
        </div>

        {/* Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<SkeletonGrid />}>
            <SentimentGrid />
          </Suspense>
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-3 text-[12px] text-white/15">
            <span className="w-1 h-1 rounded-full bg-accent/40" />
            <span>Social Alpha Trader</span>
            <span className="text-white/10">·</span>
            <span>Powered by Groq Llama 3 & Starknet</span>
          </div>
        </div>
      </main>
    </div>
  );
}
