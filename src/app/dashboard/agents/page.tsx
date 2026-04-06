import type { Metadata } from "next";
import AgentStatus from "@/components/dashboard/AgentStatus";

export const metadata: Metadata = {
  title: "Agents — Projecture Dashboard",
};

export default function DashboardAgentsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <p className="mt-1 text-sm text-slate-light">
          Monitor and manage your AI agent fleet
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-copper/20 bg-copper/5 p-6">
        <h2 className="font-semibold text-copper">Phase 3 — Coming Soon</h2>
        <p className="mt-2 text-sm text-slate-light">
          AI agents will be available in Phase 3 of the Projecture platform. These agents will
          automatically scan for properties, generate renovation cost estimates, create AI
          visualizations, and analyze market data. Agent activity will be logged and monitored here.
        </p>
      </div>

      <AgentStatus />

      {/* Agent logs placeholder */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
          <p className="text-slate-light">No agent activity yet. Agents will appear here once activated.</p>
        </div>
      </div>
    </div>
  );
}
