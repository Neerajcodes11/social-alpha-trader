type Sentiment = "positive" | "negative" | "neutral";
type Signal = "BUY" | "SELL" | "HOLD";

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const styles: Record<Sentiment, string> = {
    positive: "bg-green/10 text-green border border-green/15",
    negative: "bg-red/10 text-red border border-red/15",
    neutral: "bg-yellow/10 text-yellow border border-yellow/15",
  };
  const icons: Record<Sentiment, string> = {
    positive: "▲",
    negative: "▼",
    neutral: "◆",
  };
  return (
    <span
      className={`${styles[sentiment]} text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5`}
    >
      <span className="text-[8px]">{icons[sentiment]}</span>
      {sentiment}
    </span>
  );
}

export function SignalBadge({ signal }: { signal: Signal }) {
  const styles: Record<Signal, string> = {
    BUY: "bg-green/10 text-green border border-green/15",
    SELL: "bg-red/10 text-red border border-red/15",
    HOLD: "bg-yellow/10 text-yellow border border-yellow/15",
  };
  return (
    <span
      className={`${styles[signal]} text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg`}
    >
      {signal}
    </span>
  );
}
