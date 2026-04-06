import Badge from "@/components/ui/Badge";

interface Agent {
  name: string;
  status: "active" | "idle" | "error";
  lastRun: string | null;
  description: string;
}

const agents: Agent[] = [
  {
    name: "Property Scout",
    status: "active",
    lastRun: "Cron: Mon 7am ET",
    description: "Scans properties and scores renovation potential across target markets",
  },
  {
    name: "Deal Analyzer",
    status: "active",
    lastRun: "On-demand",
    description: "Calculates acquisition, renovation, and margin analysis",
  },
  {
    name: "Listing Writer",
    status: "active",
    lastRun: "On-demand",
    description: "Generates compelling listing copy and marketing content",
  },
  {
    name: "Buyer Matchmaker",
    status: "active",
    lastRun: "Cron: Daily 8am ET",
    description: "Matches qualified buyers to published properties",
  },
  {
    name: "Market Intelligence",
    status: "active",
    lastRun: "Cron: Sun 6pm ET",
    description: "Tracks market data and generates weekly briefs",
  },
];

const statusVariant: Record<string, "success" | "default" | "danger"> = {
  active: "success",
  idle: "default",
  error: "danger",
};

export default function AgentStatus() {
  return (
    <div className="rounded-xl border border-white/5 bg-navy-light/60">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold text-warm-white">AI Agents</h3>
        <p className="mt-0.5 text-xs text-slate">5 agents active — Claude-powered</p>
      </div>
      <div className="divide-y divide-white/5">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-warm-white">{agent.name}</p>
              <p className="text-xs text-slate">{agent.description}</p>
            </div>
            <div className="flex items-center gap-3">
              {agent.lastRun && (
                <span className="text-xs text-slate">{agent.lastRun}</span>
              )}
              <Badge variant={statusVariant[agent.status]}>{agent.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
