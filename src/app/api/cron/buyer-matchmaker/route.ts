import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/agents/shared";
import { runBuyerMatchmaker } from "@/lib/agents/buyer-matchmaker";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runBuyerMatchmaker();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron buyer-matchmaker error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
