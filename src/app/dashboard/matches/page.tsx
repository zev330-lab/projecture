"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Match {
  lead_id: string;
  lead_name: string;
  property_id: string;
  property_address: string;
  score: number;
  recommendation: string;
}

export default function DashboardMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [stats, setStats] = useState({ buyers: 0, properties: 0 });

  async function runMatchmaker() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/buyer-matchmaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      setMatches(data.matches ?? []);
      setStats({
        buyers: data.buyers_evaluated ?? 0,
        properties: data.properties_evaluated ?? 0,
      });
      setHasRun(true);
    } catch {
      // Error handled by UI
    }
    setLoading(false);
  }

  function getScoreVariant(score: number): "success" | "warning" | "danger" | "default" {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    if (score >= 30) return "default";
    return "danger";
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buyer Matches</h1>
          <p className="mt-1 text-sm text-slate-light">
            AI-powered buyer-property matching based on preferences and availability
          </p>
        </div>
        <Button
          onClick={runMatchmaker}
          disabled={loading}
          className="bg-copper hover:bg-copper-dark text-white"
        >
          {loading ? "Running Matchmaker..." : "Run Matchmaker"}
        </Button>
      </div>

      {hasRun && (
        <div className="mb-6 flex gap-4">
          <div className="rounded-lg border border-white/5 bg-navy-light/60 px-4 py-3">
            <p className="text-xs text-slate">Buyers Evaluated</p>
            <p className="text-xl font-bold text-warm-white">{stats.buyers}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-light/60 px-4 py-3">
            <p className="text-xs text-slate">Properties Evaluated</p>
            <p className="text-xl font-bold text-warm-white">{stats.properties}</p>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-light/60 px-4 py-3">
            <p className="text-xs text-slate">Matches Found</p>
            <p className="text-xl font-bold text-copper">{matches.length}</p>
          </div>
        </div>
      )}

      {!hasRun && !loading && (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">
            Click &quot;Run Matchmaker&quot; to match qualified buyers to published properties.
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 divide-y divide-white/5">
          {matches.map((match, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-warm-white">{match.lead_name}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-copper">
                      <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-semibold text-warm-white">{match.property_address}</span>
                  </div>
                  <p className="text-sm text-slate-light">{match.recommendation}</p>
                </div>
                <Badge variant={getScoreVariant(match.score)}>
                  {match.score}% match
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
