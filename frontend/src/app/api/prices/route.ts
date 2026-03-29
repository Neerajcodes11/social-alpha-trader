import { NextResponse } from "next/server";
import { getLivePrices } from "@/lib/services";

export async function GET() {
  try {
    const prices = await getLivePrices();
    return NextResponse.json({ success: true, data: prices });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as any).message }, { status: 500 });
  }
}
