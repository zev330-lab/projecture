import { NextRequest, NextResponse } from "next/server";
import { getAgentLogs } from "@/lib/agents/shared";

export async function GET(request: NextRequest) {
  const agent = request.nextUrl.searchParams.get("agent") ?? undefined;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20");

  try {
    const logs = await getAgentLogs(agent, limit);
    return NextResponse.json({ data: logs });
  } catch (err) {
    console.error("Agent logs error:", err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
