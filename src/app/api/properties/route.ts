import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ data: [], count: 0 });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");
    const beds = searchParams.get("beds");
    const sort = searchParams.get("sort");

    let query = supabase.from("properties").select("*", { count: "exact" });

    if (city) query = query.eq("city", city);
    if (type) query = query.ilike("property_type", `%${type}%`);
    if (priceMin) query = query.gte("listing_price", parseInt(priceMin));
    if (priceMax) query = query.lte("listing_price", parseInt(priceMax));
    if (beds) query = query.gte("bedrooms", parseInt(beds));

    switch (sort) {
      case "price_asc":
        query = query.order("listing_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("listing_price", { ascending: false });
        break;
      case "reno_score":
        query = query.order("renovation_score", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("Properties query error:", error);
      return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [], count: count || 0 });
  } catch (err) {
    console.error("Properties API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
