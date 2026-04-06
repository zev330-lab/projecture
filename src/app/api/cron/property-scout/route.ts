import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/agents/shared";
import { runPropertyScout } from "@/lib/agents/property-scout";

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPropertyScout({
      towns: ["Newton", "Brookline", "Wellesley", "Needham", "Lexington", "Weston", "Cambridge", "Watertown", "Waltham"],
      min_score: 50,
      max_results: 10,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron property-scout error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
