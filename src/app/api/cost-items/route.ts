import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ data: [] });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const conceptId = request.nextUrl.searchParams.get("concept_id");

    let query = supabase.from("cost_items").select("*");

    if (conceptId) {
      query = query.eq("concept_id", conceptId);
    }

    const { data, error } = await query.order("category");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch cost items" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Cost items API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from("cost_items")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create cost item" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Cost item create API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
