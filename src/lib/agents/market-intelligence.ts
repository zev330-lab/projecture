import { callClaude, logAgentAction, timedExecution } from "./shared";
import type { Property } from "@/lib/types";

// ---------------------------------------------------------------------------
// Market Intelligence — tracks market data, generates briefs, answers queries
// ---------------------------------------------------------------------------

type ReportType = "weekly_brief" | "village_analysis" | "comp_search";

interface MarketIntelParams {
  query?: string;
  report_type?: ReportType;
}

interface TownStats {
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
  town_stats: TownStats[];
  highlights: string[];
  recommendations: string[];
  narrative?: string;
}

interface MarketIntelResult {
  report_type: ReportType;
  data: MarketBrief | { answer: string; context: TownStats[] };
}

async function getAllProperties(): Promise<Property[]> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) return data as Property[];
    } catch {
      // Fall through
    }
  }

  const seedData = await import("@/lib/data/seed-data.json");
  return seedData.properties as unknown as Property[];
}

function computeTownStats(properties: Property[]): TownStats[] {
  const byTown: Record<string, Property[]> = {};
  for (const p of properties) {
    const key = p.neighborhood ? `${p.city} — ${p.neighborhood}` : p.city;
    if (!byTown[key]) byTown[key] = [];
    byTown[key].push(p);
  }

  return Object.entries(byTown).map(([town, props]) => {
    const prices = props.map((p) => p.finished_price ?? p.assessed_value ?? 0).filter((v) => v > 0);
    prices.sort((a, b) => a - b);
    const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;

    const sqftPrices = props
      .filter((p) => p.sqft && (p.finished_price || p.assessed_value))
      .map((p) => (p.finished_price ?? p.assessed_value ?? 0) / (p.sqft ?? 1));
    const avgPricePerSqft = sqftPrices.length > 0
      ? Math.round(sqftPrices.reduce((a, b) => a + b, 0) / sqftPrices.length)
      : 0;

    const finishedPrices = props.map((p) => p.finished_price ?? 0).filter((v) => v > 0);
    const avgFinished = finishedPrices.length > 0
      ? Math.round(finishedPrices.reduce((a, b) => a + b, 0) / finishedPrices.length)
      : 0;

    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const p of props) {
      byStatus[p.property_status] = (byStatus[p.property_status] ?? 0) + 1;
      const type = p.property_type ?? "Unknown";
      byType[type] = (byType[type] ?? 0) + 1;
    }

    return { town, count: props.length, median_price: median, avg_price_per_sqft: avgPricePerSqft, avg_finished_price: avgFinished, by_status: byStatus, by_type: byType };
  }).sort((a, b) => b.count - a.count);
}

function computePipelineSummary(properties: Property[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const p of properties) {
    summary[p.property_status] = (summary[p.property_status] ?? 0) + 1;
  }
  return summary;
}

function generateHighlights(properties: Property[], townStats: TownStats[]): string[] {
  const highlights: string[] = [];
  const pipeline = computePipelineSummary(properties);

  highlights.push(`${properties.length} total properties in pipeline across ${townStats.length} areas`);

  if (pipeline.published) {
    highlights.push(`${pipeline.published} properties currently published and available`);
  }
  if (pipeline.intake) {
    highlights.push(`${pipeline.intake} new properties in intake awaiting review`);
  }
  if (pipeline.sold) {
    highlights.push(`${pipeline.sold} properties sold`);
  }

  // Highest value area
  const highestValue = [...townStats].sort((a, b) => b.avg_finished_price - a.avg_finished_price)[0];
  if (highestValue && highestValue.avg_finished_price > 0) {
    highlights.push(
      `${highestValue.town} has the highest avg finished price at $${highestValue.avg_finished_price.toLocaleString()}`
    );
  }

  // Most active area
  const mostActive = townStats[0];
  if (mostActive) {
    highlights.push(`${mostActive.town} is the most active area with ${mostActive.count} properties`);
  }

  return highlights;
}

export async function runMarketIntelligence(params: MarketIntelParams = {}): Promise<MarketIntelResult> {
  const reportType = params.report_type ?? (params.query ? "comp_search" : "weekly_brief");

  const { result, duration_ms } = await timedExecution(async () => {
    const properties = await getAllProperties();
    const townStats = computeTownStats(properties);
    const pipeline = computePipelineSummary(properties);
    let totalTokens = 0;

    if (reportType === "comp_search" && params.query) {
      // Ad-hoc query
      let answer = "";

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const statsContext = townStats
            .map(
              (s) =>
                `${s.town}: ${s.count} properties, median $${s.median_price.toLocaleString()}, avg $/sqft $${s.avg_price_per_sqft}, avg finished $${s.avg_finished_price.toLocaleString()}`
            )
            .join("\n");

          const pipelineContext = Object.entries(pipeline)
            .map(([status, count]) => `${status}: ${count}`)
            .join(", ");

          const { text, inputTokens, outputTokens } = await callClaude(
            `You are a real estate market intelligence analyst for the Greater Boston / MetroWest market. Answer this question using the data below.\n\nQuestion: ${params.query}\n\nPipeline summary: ${pipelineContext}\n\nMarket data by area:\n${statsContext}\n\nAnswer concisely and specifically. Reference numbers where possible.`,
            { model: "claude-sonnet-4-20250514", maxTokens: 1024 }
          );
          answer = text.trim();
          totalTokens = inputTokens + outputTokens;
        } catch {
          answer = "Unable to process query — Claude API unavailable.";
        }
      } else {
        answer = `Market data: ${townStats.length} areas tracked, ${properties.length} total properties. Pipeline: ${Object.entries(pipeline).map(([s, c]) => `${s}: ${c}`).join(", ")}`;
      }

      await logAgentAction({
        agent_name: "market-intelligence",
        action: `Query: ${params.query}`,
        details: { query: params.query, answer },
        status: "completed",
        tokens_used: totalTokens,
      });

      return {
        report_type: "comp_search" as ReportType,
        data: { answer, context: townStats },
      };
    }

    // Weekly brief or village analysis
    const highlights = generateHighlights(properties, townStats);
    const recommendations: string[] = [];

    // Generate narrative with Claude
    let narrative = "";
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const statsStr = townStats
          .slice(0, 10)
          .map(
            (s) =>
              `${s.town}: ${s.count} properties, median $${s.median_price.toLocaleString()}, $/sqft $${s.avg_price_per_sqft}, finished avg $${s.avg_finished_price.toLocaleString()}, types: ${Object.entries(s.by_type).map(([t, c]) => `${t}(${c})`).join(", ")}, status: ${Object.entries(s.by_status).map(([st, c]) => `${st}(${c})`).join(", ")}`
          )
          .join("\n");

        const { text, inputTokens, outputTokens } = await callClaude(
          `You are a real estate market intelligence analyst. Generate a concise weekly market brief for the Projecture team (they buy, renovate, and sell homes in Greater Boston / MetroWest).

Market data:
${statsStr}

Pipeline: ${Object.entries(pipeline).map(([s, c]) => `${s}: ${c}`).join(", ")}
Total properties: ${properties.length}

Write:
1. A 2-3 paragraph market narrative (key observations, trends, notable data points)
2. 3-5 actionable recommendations for the team

Respond in JSON: { "narrative": "...", "recommendations": ["...", "..."] }`,
          { model: "claude-sonnet-4-20250514", maxTokens: 1500 }
        );
        totalTokens = inputTokens + outputTokens;

        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            narrative = parsed.narrative ?? "";
            if (parsed.recommendations) {
              recommendations.push(...parsed.recommendations);
            }
          }
        } catch {
          narrative = text;
        }
      } catch {
        narrative = `Weekly market brief: ${properties.length} properties across ${townStats.length} areas. ${highlights.join(". ")}.`;
        recommendations.push("Review intake properties for Sarina review", "Consider expanding to secondary markets");
      }
    } else {
      narrative = `Weekly market brief: ${properties.length} properties across ${townStats.length} areas. ${highlights.join(". ")}.`;
      recommendations.push("Review intake properties for Sarina review", "Consider expanding to secondary markets");
    }

    const brief: MarketBrief = {
      generated_at: new Date().toISOString(),
      pipeline_summary: pipeline,
      town_stats: townStats,
      highlights,
      recommendations,
      narrative,
    };

    await logAgentAction({
      agent_name: "market-intelligence",
      action: `Generated ${reportType}`,
      details: {
        report_type: reportType,
        areas_analyzed: townStats.length,
        total_properties: properties.length,
        highlights_count: highlights.length,
      },
      status: "completed",
      tokens_used: totalTokens,
    });

    return { report_type: reportType, data: brief };
  });

  await logAgentAction({
    agent_name: "market-intelligence",
    action: "run_complete",
    details: { duration_ms },
    status: "completed",
    duration_ms,
  });

  return result;
}
