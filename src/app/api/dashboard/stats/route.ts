import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({
      leads: 0,
      properties: 0,
      concepts: 0,
      recentActivity: 0,
    });
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

    const [leadsResult, propertiesResult, conceptsResult, agentLogsResult] =
      await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase
          .from("renovation_concepts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("agent_logs")
          .select("*", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ),
      ]);

    return NextResponse.json({
      leads: leadsResult.count || 0,
      properties: propertiesResult.count || 0,
      concepts: conceptsResult.count || 0,
      recentActivity: agentLogsResult.count || 0,
    });
  } catch (err) {
    console.error("Dashboard stats API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
