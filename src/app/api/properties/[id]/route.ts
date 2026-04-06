import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const { data: concepts } = await supabase
      .from("renovation_concepts")
      .select("*")
      .eq("property_id", id)
      .eq("status", "published");

    const conceptsWithCosts = await Promise.all(
      (concepts || []).map(async (concept) => {
        const { data: costItems } = await supabase
          .from("cost_items")
          .select("*")
          .eq("concept_id", concept.id)
          .order("category");

        return { ...concept, cost_items: costItems || [] };
      })
    );

    return NextResponse.json({
      ...property,
      renovation_concepts: conceptsWithCosts,
    });
  } catch (err) {
    console.error("Property detail API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
