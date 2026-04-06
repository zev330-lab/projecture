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
    status: "idle",
    lastRun: null,
    description: "Scans MLS for properties matching buyer criteria",
  },
  {
    name: "Cost Estimator",
    status: "idle",
    lastRun: null,
    description: "Generates renovation cost breakdowns from project data",
  },
  {
    name: "Visualization Engine",
    status: "idle",
    lastRun: null,
    description: "Creates AI renderings of renovation concepts",
  },
  {
    name: "Market Analyzer",
    status: "idle",
    lastRun: null,
    description: "Calculates ARV and ROI for renovation scenarios",
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
        <p className="mt-0.5 text-xs text-slate">Phase 3 — Coming Soon</p>
      </div>
      <div className="divide-y divide-white/5">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-warm-white">{agent.name}</p>
              <p className="text-xs text-slate">{agent.description}</p>
            </div>
            <Badge variant={statusVariant[agent.status]}>{agent.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
