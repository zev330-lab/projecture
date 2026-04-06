import { NextRequest, NextResponse } from "next/server";
import { runDealAnalyzer } from "@/lib/agents/deal-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, analysis_type } = body as {
      property_id: string;
      analysis_type?: "acquisition" | "renovation" | "full";
    };

    if (!property_id) {
      return NextResponse.json({ error: "property_id is required" }, { status: 400 });
    }

    const result = await runDealAnalyzer({
      property_id,
      analysis_type: analysis_type ?? "full",
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Deal Analyzer error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
