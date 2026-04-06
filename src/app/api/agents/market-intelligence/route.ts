import { NextRequest, NextResponse } from "next/server";
import { runMarketIntelligence } from "@/lib/agents/market-intelligence";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query, report_type } = body as {
      query?: string;
      report_type?: "weekly_brief" | "village_analysis" | "comp_search";
    };

    const result = await runMarketIntelligence({ query, report_type });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Market Intelligence error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
