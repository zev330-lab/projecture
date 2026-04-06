"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  cronSchedule: string | null;
  icon: React.ReactNode;
}

const AGENTS: AgentConfig[] = [
  {
    id: "property-scout",
    name: "Property Scout",
    description: "Scans properties and scores renovation potential across target markets",
    endpoint: "/api/agents/property-scout",
    cronSchedule: "Mondays 7am ET",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "deal-analyzer",
    name: "Deal Analyzer",
    description: "Calculates acquisition costs, renovation estimates, and margin analysis",
    endpoint: "/api/agents/deal-analyzer",
    cronSchedule: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 15l4-4 3 3 4-6 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="1" y="1" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "listing-writer",
    name: "Listing Writer",
    description: "Generates compelling listing copy, social posts, and email announcements",
    endpoint: "/api/agents/listing-writer",
    cronSchedule: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17l1.5-4.5L14 3l3 3L7.5 15.5 3 17z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "buyer-matchmaker",
    name: "Buyer Matchmaker",
    description: "Matches qualified buyers to published properties based on preferences",
    endpoint: "/api/agents/buyer-matchmaker",
    cronSchedule: "Daily 8am ET",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 18c0-3 2-5 7-5s7 2 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "market-intelligence",
    name: "Market Intelligence",
    description: "Tracks market data, generates weekly briefs, answers ad-hoc queries",
    endpoint: "/api/agents/market-intelligence",
    cronSchedule: "Sundays 6pm ET",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 1v18M1 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

interface AgentRun {
  agent: string;
  status: "idle" | "running" | "completed" | "failed";
  result?: Record<string, unknown>;
  error?: string;
}

export default function DashboardAgentsPage() {
  const [runs, setRuns] = useState<Record<string, AgentRun>>({});
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [scoutTowns, setScoutTowns] = useState("Newton,Brookline");
  const [scoutMinScore, setScoutMinScore] = useState("50");
  const [dealPropertyId, setDealPropertyId] = useState("");
  const [dealType, setDealType] = useState<"full" | "acquisition" | "renovation">("full");
  const [listingPropertyId, setListingPropertyId] = useState("");
  const [marketQuery, setMarketQuery] = useState("");

  async function runAgent(agentId: string, body: Record<string, unknown> = {}) {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent) return;

    setRuns((prev) => ({
      ...prev,
      [agentId]: { agent: agentId, status: "running" },
    }));

    try {
      const res = await fetch(agent.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setRuns((prev) => ({
          ...prev,
          [agentId]: { agent: agentId, status: "failed", error: data.error },
        }));
      } else {
        setRuns((prev) => ({
          ...prev,
          [agentId]: { agent: agentId, status: "completed", result: data },
        }));
      }
    } catch (err) {
      setRuns((prev) => ({
        ...prev,
        [agentId]: {
          agent: agentId,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      }));
    }
  }

  function getStatusBadge(agentId: string) {
    const run = runs[agentId];
    if (!run || run.status === "idle") return <Badge variant="default">idle</Badge>;
    if (run.status === "running") return <Badge variant="warning">running...</Badge>;
    if (run.status === "completed") return <Badge variant="success">completed</Badge>;
    return <Badge variant="danger">failed</Badge>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <p className="mt-1 text-sm text-slate-light">
          Monitor and control your AI agent fleet — 5 agents powering the deal pipeline
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4">
        {AGENTS.map((agent) => {
          const run = runs[agent.id];
          const isExpanded = expandedAgent === agent.id;

          return (
            <div
              key={agent.id}
              className="rounded-xl border border-white/5 bg-navy-light/60 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-copper/10 text-copper">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-warm-white">{agent.name}</h3>
                    <p className="text-xs text-slate-light">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {agent.cronSchedule && (
                    <span className="text-xs text-slate">Cron: {agent.cronSchedule}</span>
                  )}
                  {getStatusBadge(agent.id)}
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-light hover:bg-white/5 hover:text-warm-white transition-colors"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>

              {/* Expanded Controls */}
              {isExpanded && (
                <div className="border-t border-white/5 px-6 py-4">
                  {/* Agent-specific inputs */}
                  {agent.id === "property-scout" && (
                    <div className="mb-4 flex flex-wrap gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate">Towns (comma-separated)</label>
                        <input
                          type="text"
                          value={scoutTowns}
                          onChange={(e) => setScoutTowns(e.target.value)}
                          className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate">Min Score</label>
                        <input
                          type="number"
                          value={scoutMinScore}
                          onChange={(e) => setScoutMinScore(e.target.value)}
                          className="w-20 rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                        />
                      </div>
                    </div>
                  )}

                  {agent.id === "deal-analyzer" && (
                    <div className="mb-4 flex flex-wrap gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate">Property ID</label>
                        <input
                          type="text"
                          value={dealPropertyId}
                          onChange={(e) => setDealPropertyId(e.target.value)}
                          placeholder="UUID"
                          className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate">Analysis Type</label>
                        <select
                          value={dealType}
                          onChange={(e) => setDealType(e.target.value as typeof dealType)}
                          className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                        >
                          <option value="full">Full</option>
                          <option value="acquisition">Acquisition Only</option>
                          <option value="renovation">Renovation Only</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {agent.id === "listing-writer" && (
                    <div className="mb-4">
                      <label className="mb-1 block text-xs text-slate">Property ID</label>
                      <input
                        type="text"
                        value={listingPropertyId}
                        onChange={(e) => setListingPropertyId(e.target.value)}
                        placeholder="UUID"
                        className="rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                      />
                    </div>
                  )}

                  {agent.id === "market-intelligence" && (
                    <div className="mb-4">
                      <label className="mb-1 block text-xs text-slate">Query (leave empty for weekly brief)</label>
                      <input
                        type="text"
                        value={marketQuery}
                        onChange={(e) => setMarketQuery(e.target.value)}
                        placeholder="e.g. What's the ARV for a colonial in Waban?"
                        className="w-full rounded-md border border-white/10 bg-navy px-3 py-1.5 text-sm text-warm-white"
                      />
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => {
                      if (agent.id === "property-scout") {
                        runAgent(agent.id, {
                          towns: scoutTowns.split(",").map((t) => t.trim()),
                          min_score: parseInt(scoutMinScore) || 50,
                        });
                      } else if (agent.id === "deal-analyzer") {
                        runAgent(agent.id, { property_id: dealPropertyId, analysis_type: dealType });
                      } else if (agent.id === "listing-writer") {
                        runAgent(agent.id, { property_id: listingPropertyId });
                      } else if (agent.id === "buyer-matchmaker") {
                        runAgent(agent.id);
                      } else if (agent.id === "market-intelligence") {
                        runAgent(agent.id, marketQuery ? { query: marketQuery } : { report_type: "weekly_brief" });
                      }
                    }}
                    disabled={run?.status === "running"}
                    className="bg-copper hover:bg-copper-dark text-white"
                  >
                    {run?.status === "running" ? "Running..." : "Run Now"}
                  </Button>

                  {/* Results */}
                  {run?.status === "completed" && run.result && (
                    <div className="mt-4 rounded-lg border border-white/5 bg-navy/80 p-4">
                      <h4 className="mb-2 text-xs font-semibold text-copper">Results</h4>
                      <pre className="max-h-96 overflow-auto text-xs text-slate-light whitespace-pre-wrap">
                        {JSON.stringify(run.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {run?.status === "failed" && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-xs text-red-400">{run.error ?? "Agent run failed"}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <ActivityFeed />
      </div>
    </div>
  );
}

function ActivityFeed() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/logs?limit=20");
      const data = await res.json();
      setLogs(data.data ?? []);
    } catch {
      // No logs available
    }
    setLoading(false);
    setLoaded(true);
  }

  if (!loaded) {
    return (
      <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
        <Button size="sm" variant="outline" onClick={fetchLogs} className="border-white/10 text-slate-light hover:text-warm-white">
          Load Activity Feed
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
        <p className="text-slate-light">Loading...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
        <p className="text-slate-light">No agent activity yet. Run an agent above to see activity here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-navy-light/60 divide-y divide-white/5">
      {logs.map((log, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-medium text-warm-white">
              {String(log.agent_name ?? "")}
            </p>
            <p className="text-xs text-slate-light">{String(log.action ?? "")}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {log.tokens_used != null && (
              <span className="text-slate">{String(log.tokens_used)} tokens</span>
            )}
            {log.duration_ms != null && (
              <span className="text-slate">{String(log.duration_ms)}ms</span>
            )}
            <Badge
              variant={
                log.status === "completed"
                  ? "success"
                  : log.status === "failed"
                  ? "danger"
                  : "default"
              }
            >
              {String(log.status ?? "unknown")}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
