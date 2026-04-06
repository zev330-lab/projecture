import type { Metadata } from "next";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentLeads from "@/components/dashboard/RecentLeads";
import AgentStatus from "@/components/dashboard/AgentStatus";
import type { Lead } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard — Projecture",
};

async function getDashboardData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { stats: { leads: 0, properties: 0, concepts: 0, recentActivity: 0 }, recentLeads: [] };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [leadsCount, propsCount, conceptsCount, recentLeadsResult] = await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("renovation_concepts").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    return {
      stats: {
        leads: leadsCount.count || 0,
        properties: propsCount.count || 0,
        concepts: conceptsCount.count || 0,
        recentActivity: 0,
      },
      recentLeads: (recentLeadsResult.data as Lead[]) || [],
    };
  } catch {
    return { stats: { leads: 0, properties: 0, concepts: 0, recentActivity: 0 }, recentLeads: [] };
  }
}

export default async function DashboardPage() {
  const { stats, recentLeads } = await getDashboardData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-light">Overview of your Projecture platform</p>
      </div>

      <StatsCards
        stats={[
          { label: "Total Leads", value: stats.leads },
          { label: "Properties", value: stats.properties },
          { label: "Renovation Concepts", value: stats.concepts },
          { label: "Agent Activity (7d)", value: stats.recentActivity },
        ]}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <RecentLeads leads={recentLeads} />
        <AgentStatus />
      </div>
    </div>
  );
}
