import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/agents/shared";
import { runMarketIntelligence } from "@/lib/agents/market-intelligence";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMarketIntelligence({ report_type: "weekly_brief" });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron market-intelligence error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
