"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface TownStat {
  town: string;
  count: number;
  median_price: number;
  avg_price_per_sqft: number;
  avg_finished_price: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
}

interface MarketBrief {
  generated_at: string;
  pipeline_summary: Record<string, number>;
  town_stats: TownStat[];
  highlights: string[];
  recommendations: string[];
  narrative?: string;
}

export default function DashboardIntelligencePage() {
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [query, setQuery] = useState("");
  const [queryAnswer, setQueryAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);

  async function generateBrief() {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_type: "weekly_brief" }),
      });
      const data = await res.json();
      if (data.data) setBrief(data.data as MarketBrief);
    } catch {
      // Error handled
    }
    setLoading(false);
  }

  async function askQuestion() {
    if (!query.trim()) return;
    setQueryLoading(true);
    setQueryAnswer("");
    try {
      const res = await fetch("/api/agents/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setQueryAnswer(data.data?.answer ?? "No answer returned.");
    } catch {
      setQueryAnswer("Failed to process query.");
    }
    setQueryLoading(false);
  }

  function fmt(n: number): string {
    return n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Intelligence</h1>
          <p className="mt-1 text-sm text-slate-light">
            Market data, pipeline analytics, and AI-powered insights
          </p>
        </div>
        <Button
          onClick={generateBrief}
          disabled={loading}
          className="bg-copper hover:bg-copper-dark text-white"
        >
          {loading ? "Generating..." : "Generate Weekly Brief"}
        </Button>
      </div>

      {/* Query box */}
      <div className="mb-8 rounded-xl border border-white/5 bg-navy-light/60 p-6">
        <h3 className="mb-3 text-sm font-semibold text-warm-white">Ask a Question</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
            placeholder="e.g. What's the ARV for a renovated colonial in Waban?"
            className="flex-1 rounded-md border border-white/10 bg-navy px-4 py-2 text-sm text-warm-white placeholder-slate"
          />
          <Button
            size="sm"
            onClick={askQuestion}
            disabled={queryLoading}
            className="bg-copper hover:bg-copper-dark text-white"
          >
            {queryLoading ? "Thinking..." : "Ask"}
          </Button>
        </div>
        {queryAnswer && (
          <div className="mt-4 rounded-lg border border-white/5 bg-navy/80 p-4">
            <p className="text-sm text-slate-light whitespace-pre-wrap">{queryAnswer}</p>
          </div>
        )}
      </div>

      {!brief && !loading && (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">
            Click &quot;Generate Weekly Brief&quot; to analyze the market and pipeline.
          </p>
        </div>
      )}

      {brief && (
        <>
          {/* Pipeline Summary */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-warm-white">Pipeline Summary</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(brief.pipeline_summary).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-lg border border-white/5 bg-navy-light/60 px-4 py-3 min-w-[120px]"
                >
                  <p className="text-xs text-slate capitalize">{status.replace("_", " ")}</p>
                  <p className="text-xl font-bold text-warm-white">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative */}
          {brief.narrative && (
            <div className="mb-6 rounded-xl border border-white/5 bg-navy-light/60 p-6">
              <h3 className="mb-3 text-sm font-semibold text-warm-white">Market Narrative</h3>
              <p className="text-sm text-slate-light whitespace-pre-wrap leading-relaxed">{brief.narrative}</p>
            </div>
          )}

          {/* Highlights & Recommendations */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/5 bg-navy-light/60 p-6">
              <h3 className="mb-3 text-sm font-semibold text-warm-white">Highlights</h3>
              <ul className="space-y-2">
                {brief.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-light">
                    <span className="mt-0.5 text-copper">-</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/5 bg-navy-light/60 p-6">
              <h3 className="mb-3 text-sm font-semibold text-warm-white">Recommendations</h3>
              <ul className="space-y-2">
                {brief.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-light">
                    <span className="mt-0.5 text-copper">{i + 1}.</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Town Stats Table */}
          <div className="rounded-xl border border-white/5 bg-navy-light/60 overflow-hidden">
            <div className="border-b border-white/5 px-6 py-4">
              <h3 className="text-sm font-semibold text-warm-white">Market Data by Area</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate">
                    <th className="px-6 py-3 text-left font-medium">Area</th>
                    <th className="px-4 py-3 text-right font-medium">Count</th>
                    <th className="px-4 py-3 text-right font-medium">Median Price</th>
                    <th className="px-4 py-3 text-right font-medium">Avg $/sqft</th>
                    <th className="px-4 py-3 text-right font-medium">Avg Finished</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Types</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {brief.town_stats.map((stat) => (
                    <tr key={stat.town} className="text-slate-light">
                      <td className="px-6 py-3 font-medium text-warm-white">{stat.town}</td>
                      <td className="px-4 py-3 text-right">{stat.count}</td>
                      <td className="px-4 py-3 text-right">{fmt(stat.median_price)}</td>
                      <td className="px-4 py-3 text-right">${stat.avg_price_per_sqft}</td>
                      <td className="px-4 py-3 text-right">{fmt(stat.avg_finished_price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(stat.by_status).map(([s, c]) => (
                            <Badge key={s} variant="default">
                              {s.replace("_", " ")} ({c})
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(stat.by_type).map(([t, c]) => (
                            <Badge key={t} variant="copper">
                              {t} ({c})
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
