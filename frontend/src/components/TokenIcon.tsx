const TOKEN_STYLES: Record<string, { bg: string; text: string; label: string; glow: string }> = {
  ETH: { 
    bg: "bg-gradient-to-br from-[#627EEA]/25 to-[#627EEA]/10 border border-[#627EEA]/20", 
    text: "text-[#8a9ef0]", 
    label: "Ξ",
    glow: "shadow-[0_0_12px_rgba(98,126,234,0.15)]"
  },
  BTC: { 
    bg: "bg-gradient-to-br from-[#F7931A]/25 to-[#F7931A]/10 border border-[#F7931A]/20", 
    text: "text-[#F7931A]", 
    label: "₿",
    glow: "shadow-[0_0_12px_rgba(247,147,26,0.15)]"
  },
  SOL: { 
    bg: "bg-gradient-to-br from-[#9945FF]/25 to-[#9945FF]/10 border border-[#9945FF]/20", 
    text: "text-[#14F195]", 
    label: "◎",
    glow: "shadow-[0_0_12px_rgba(153,69,255,0.15)]"
  },
};

export default function TokenIcon({
  symbol,
  size = "md",
}: {
  symbol: string;
  size?: "sm" | "md" | "lg";
}) {
  const styles = TOKEN_STYLES[symbol] ?? {
    bg: "bg-white/10 border border-white/20",
    text: "text-white",
    label: symbol[0],
    glow: "",
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-11 h-11 text-lg",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <div
      className={`${styles.bg} ${styles.text} ${styles.glow} ${sizeClasses[size]} rounded-full flex items-center justify-center font-bold font-mono shrink-0 transition-shadow duration-300`}
    >
      {styles.label}
    </div>
  );
}
