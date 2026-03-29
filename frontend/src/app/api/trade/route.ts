import { NextRequest, NextResponse } from "next/server";

// ── Mock trade execution (simulates StarkZap) ──
// In V1+, this will be replaced by client-side wallet signing via starknetkit + AVNU

function getTokenPrice(symbol: string): number {
  const prices: Record<string, number> = { ETH: 3241.5, BTC: 67850.0, SOL: 185.4 };
  return prices[symbol] ?? 1;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { symbol, amountUsd, tradeType } = body;

  if (!symbol || !amountUsd || !tradeType) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: symbol, amountUsd, tradeType" },
      { status: 400 }
    );
  }

  if (!["buy", "sell"].includes(tradeType)) {
    return NextResponse.json({ success: false, error: "tradeType must be 'buy' or 'sell'" }, { status: 400 });
  }

  if (amountUsd < 1 || amountUsd > 10000) {
    return NextResponse.json({ success: false, error: "amountUsd must be between 1 and 10000" }, { status: 400 });
  }

  const tokenPrice = getTokenPrice(symbol.toUpperCase());
  const tokenAmount = (amountUsd / tokenPrice).toFixed(6);
  const mockHash = "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

  return NextResponse.json({
    success: true,
    data: {
      success: true,
      txHash: mockHash,
      explorerUrl: `https://sepolia.voyager.online/tx/${mockHash}`,
      tokenAmount: `${tokenAmount} ${symbol.toUpperCase()}`,
      symbol: symbol.toUpperCase(),
      amountUsd,
      network: "sepolia (simulated)",
    },
  });
}
