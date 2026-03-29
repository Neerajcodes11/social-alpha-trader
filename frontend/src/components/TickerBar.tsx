const TOKENS = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "SOL", name: "Solana" },
];

export default function TickerBar({ prices }: { prices: Record<string, { usd: number, change24h: number }> }) {
  return (
    <div className="flex items-center gap-6 px-5 py-3.5 glass-card border border-white/[0.06] rounded-xl overflow-x-auto mb-8 scrollbar-none animate-fade-in" style={{ animationDelay: "150ms", opacity: 0 }}>
      {TOKENS.map((t, i) => {
        const data = prices[t.symbol];
        if (!data) return null;
        const price = data.usd;
        const change = data.change24h;
        const isPos = change >= 0;
        return (
          <div key={t.symbol} className="flex items-center gap-3 whitespace-nowrap">
            {i > 0 && <span className="text-white/[0.08]">│</span>}
            <span className="font-mono font-bold text-[13px] text-white/70">{t.symbol}</span>
            <span className="font-mono text-[13px] text-white/50">
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${isPos ? "text-green bg-green/10" : "text-red bg-red/10"}`}
            >
              {isPos ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        );
      })}
      <div className="ml-auto flex items-center gap-2 text-[11px] text-white/20 whitespace-nowrap">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-40" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green" />
        </span>
        Streaming
      </div>
    </div>
  );
}
