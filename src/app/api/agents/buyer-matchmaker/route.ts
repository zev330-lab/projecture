import { NextRequest, NextResponse } from "next/server";
import { runBuyerMatchmaker } from "@/lib/agents/buyer-matchmaker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { lead_id } = body as { lead_id?: string };

    const result = await runBuyerMatchmaker({ lead_id });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Buyer Matchmaker error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
