import { NextRequest, NextResponse } from "next/server";
import { runListingWriter } from "@/lib/agents/listing-writer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, output_types, style_notes } = body as {
      property_id: string;
      output_types?: string[];
      style_notes?: string;
    };

    if (!property_id) {
      return NextResponse.json({ error: "property_id is required" }, { status: 400 });
    }

    const result = await runListingWriter({ property_id, output_types, style_notes });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Listing Writer error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent failed" },
      { status: 500 }
    );
  }
}
