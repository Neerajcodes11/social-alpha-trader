import { NextRequest, NextResponse } from "next/server";
import { getSentiment } from "@/lib/services";

const SUPPORTED = ["ETH", "BTC", "SOL"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get("symbol");

  if (symbolParam) {
    const symbol = symbolParam.toUpperCase();
    if (!SUPPORTED.includes(symbol)) {
      return NextResponse.json({ success: false, error: `Unsupported token` }, { status: 400 });
    }
    const result = await getSentiment(symbol);
    return NextResponse.json({ success: true, data: result });
  }

  // All tokens
  const results = await Promise.all(SUPPORTED.map((s) => getSentiment(s)));
  return NextResponse.json({ success: true, data: results });
}
