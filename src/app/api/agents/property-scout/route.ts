import { NextRequest, NextResponse } from "next/server";
import { runPropertyScout } from "@/lib/agents/property-scout";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { towns, min_score, max_results } = body as {
      towns?: string[];
      min_score?: number;
      max_results?: number;
    };

    const result = await runPropertyScout({ towns, min_score, max_results });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Property Scout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
