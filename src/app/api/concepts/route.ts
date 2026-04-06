import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ data: [] });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const propertyId = request.nextUrl.searchParams.get("property_id");

    let query = supabase.from("renovation_concepts").select("*");

    if (propertyId) {
      query = query.eq("property_id", propertyId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch concepts" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Concepts API error:", err);
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
      .from("renovation_concepts")
      .insert({ ...body, created_by: user.id })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create concept" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Concept create API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
