import { callClaude, logAgentAction, timedExecution } from "./shared";
import type { Property } from "@/lib/types";

// ---------------------------------------------------------------------------
// Deal Analyzer — acquisition + renovation + margin analysis
// ---------------------------------------------------------------------------

type AnalysisType = "acquisition" | "renovation" | "full";

interface DealAnalysisParams {
  property_id: string;
  analysis_type: AnalysisType;
}

interface AcquisitionAnalysis {
  estimated_acquisition_cost: number;
  estimated_arv: number;
  price_per_sqft: number;
  comp_properties: CompProperty[];
  recommendation: string;
}

interface RenovationAnalysis {
  estimated_renovation_cost: number;
  scope: string[];
  timeline_weeks: number;
  cost_breakdown: Record<string, { low: number; high: number }>;
  contingency: number;
  recommendation: string;
}

interface MarginAnalysis {
  acquisition_cost: number;
  renovation_cost: number;
  carrying_costs: number;
  selling_costs: number;
  total_cost: number;
  estimated_arv: number;
  gross_profit: number;
  roi_percentage: number;
  suggested_finished_price: number;
  deal_grade: "Strong" | "Viable" | "Marginal" | "Pass";
  recommendation: string;
}

interface CompProperty {
  address: string;
  city: string;
  price: number;
  sqft: number;
  price_per_sqft: number;
  similarity_note: string;
}

interface FullAnalysis {
  property: Pick<Property, "id" | "address" | "city" | "neighborhood" | "property_type" | "sqft" | "bedrooms" | "bathrooms" | "year_built">;
  acquisition?: AcquisitionAnalysis;
  renovation?: RenovationAnalysis;
  margin?: MarginAnalysis;
}

// Bay State Remodeling cost benchmarks
const RENO_BENCHMARKS: Record<string, { low: number; high: number; label: string }> = {
  kitchen_full: { low: 75000, high: 120000, label: "Full kitchen renovation" },
  kitchen_update: { low: 35000, high: 60000, label: "Kitchen update" },
  primary_bath: { low: 45000, high: 65000, label: "Primary bathroom" },
  guest_bath: { low: 25000, high: 40000, label: "Guest bathroom" },
  basement: { low: 45000, high: 75000, label: "Basement finishing" },
  addition: { low: 150000, high: 250000, label: "Room addition" },
  hvac: { low: 15000, high: 30000, label: "HVAC replacement" },
  roof: { low: 15000, high: 25000, label: "Roof replacement" },
  windows: { low: 15000, high: 30000, label: "Window replacement" },
  siding: { low: 20000, high: 40000, label: "Siding replacement" },
  hardwood: { low: 8000, high: 15000, label: "Hardwood floors" },
  electrical: { low: 10000, high: 25000, label: "Electrical update" },
  plumbing: { low: 10000, high: 20000, label: "Plumbing update" },
  landscaping: { low: 10000, high: 25000, label: "Landscaping" },
};

function estimateRenovationScope(p: Property): string[] {
  const scope: string[] = [];
  const age = new Date().getFullYear() - (p.year_built ?? 1970);

  // Kitchen is almost always included
  scope.push("kitchen_full");

  // Bathrooms
  if ((p.bathrooms ?? 0) >= 2) {
    scope.push("primary_bath");
    scope.push("guest_bath");
  } else {
    scope.push("primary_bath");
  }

  // Old homes need systems
  if (age > 30) {
    scope.push("hvac");
    scope.push("electrical");
  }
  if (age > 40) {
    scope.push("windows");
    scope.push("plumbing");
  }
  if (age > 50) {
    scope.push("roof");
  }

  // Hardwood is standard in this market
  scope.push("hardwood");

  // Basement if large enough home
  if ((p.sqft ?? 0) > 1500) {
    scope.push("basement");
  }

  // Landscaping always
  scope.push("landscaping");

  return scope;
}

function calculateRenovation(p: Property): RenovationAnalysis {
  const scope = estimateRenovationScope(p);
  const breakdown: Record<string, { low: number; high: number }> = {};
  let totalLow = 0;
  let totalHigh = 0;

  for (const item of scope) {
    const bench = RENO_BENCHMARKS[item];
    if (bench) {
      breakdown[bench.label] = { low: bench.low, high: bench.high };
      totalLow += bench.low;
      totalHigh += bench.high;
    }
  }

  const contingency = Math.round((totalLow + totalHigh) / 2 * 0.15);
  const estimatedCost = Math.round((totalLow + totalHigh) / 2 + contingency);

  // Timeline: roughly 1 week per $15K of work, min 8 weeks
  const timelineWeeks = Math.max(8, Math.round(estimatedCost / 15000));

  return {
    estimated_renovation_cost: estimatedCost,
    scope: scope.map((s) => RENO_BENCHMARKS[s]?.label ?? s),
    timeline_weeks: timelineWeeks,
    cost_breakdown: breakdown,
    contingency,
    recommendation: "",
  };
}

async function fetchProperty(propertyId: string): Promise<Property | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (data) return data as Property;
    } catch {
      // Fall through
    }
  }

  // Fallback to seed data
  const seedData = await import("@/lib/data/seed-data.json");
  const props = seedData.properties as unknown as Property[];
  return props.find((p) => p.id === propertyId) ?? null;
}

async function findComps(property: Property): Promise<CompProperty[]> {
  // Search for similar properties in the same city
  let allProperties: Property[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = await createServiceClient();
      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("city", property.city)
        .neq("id", property.id)
        .limit(20);
      allProperties = (data ?? []) as Property[];
    } catch {
      // Fall through
    }
  }

  if (allProperties.length === 0) {
    const seedData = await import("@/lib/data/seed-data.json");
    allProperties = (seedData.properties as unknown as Property[]).filter(
      (p) => p.city === property.city && p.address !== property.address
    );
  }

  return allProperties
    .filter((p) => p.finished_price || p.assessed_value)
    .map((p) => {
      const price = p.finished_price ?? p.assessed_value ?? 0;
      const sqft = p.sqft ?? 1;
      return {
        address: p.address,
        city: p.city,
        price,
        sqft,
        price_per_sqft: Math.round(price / sqft),
        similarity_note: [
          p.property_type === property.property_type ? "Same type" : null,
          p.neighborhood === property.neighborhood ? "Same village" : null,
          Math.abs((p.bedrooms ?? 0) - (property.bedrooms ?? 0)) <= 1 ? "Similar beds" : null,
        ]
          .filter(Boolean)
          .join(", ") || "Nearby comparable",
      };
    })
    .sort((a, b) => {
      // Sort by similarity (more matching factors = better comp)
      const aFactors = a.similarity_note.split(", ").length;
      const bFactors = b.similarity_note.split(", ").length;
      return bFactors - aFactors;
    })
    .slice(0, 5);
}

export async function runDealAnalyzer(params: DealAnalysisParams): Promise<FullAnalysis> {
  const { result, duration_ms } = await timedExecution(async () => {
    const property = await fetchProperty(params.property_id);
    if (!property) {
      throw new Error(`Property ${params.property_id} not found`);
    }

    const analysis: FullAnalysis = {
      property: {
        id: property.id,
        address: property.address,
        city: property.city,
        neighborhood: property.neighborhood,
        property_type: property.property_type,
        sqft: property.sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        year_built: property.year_built,
      },
    };

    let totalTokens = 0;

    // Acquisition analysis
    if (params.analysis_type === "acquisition" || params.analysis_type === "full") {
      const comps = await findComps(property);
      const avgPricePerSqft =
        comps.length > 0
          ? Math.round(comps.reduce((sum, c) => sum + c.price_per_sqft, 0) / comps.length)
          : 450;

      const sqft = property.sqft ?? 1800;
      const estimatedAcquisition = property.acquisition_cost ?? Math.round(sqft * avgPricePerSqft * 0.8);
      const estimatedArv = Math.round(sqft * avgPricePerSqft * 1.3);

      let recommendation = "";
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const compList = comps
            .map((c) => `- ${c.address}: $${c.price.toLocaleString()} ($${c.price_per_sqft}/sqft) — ${c.similarity_note}`)
            .join("\n");

          const { text, inputTokens, outputTokens } = await callClaude(
            `You are a real estate acquisition analyst. Assess this property for acquisition:\n\nProperty: ${property.address}, ${property.city} ${property.neighborhood ? `(${property.neighborhood})` : ""}\nType: ${property.property_type}, Built: ${property.year_built}, ${property.sqft}sqft, ${property.bedrooms}BR/${property.bathrooms}BA\nAssessed: $${property.assessed_value?.toLocaleString()}\nLot: ${property.lot_sqft?.toLocaleString()}sqft\n\nComps:\n${compList}\n\nEstimated acquisition: $${estimatedAcquisition.toLocaleString()}\nEstimated ARV (renovated): $${estimatedArv.toLocaleString()}\n\nProvide a 2-3 sentence recommendation on this acquisition opportunity.`,
            { model: "claude-sonnet-4-20250514", maxTokens: 512 }
          );
          recommendation = text.trim();
          totalTokens += inputTokens + outputTokens;
        } catch {
          recommendation = `Based on comparable sales averaging $${avgPricePerSqft}/sqft, target acquisition at $${estimatedAcquisition.toLocaleString()} with ARV potential of $${estimatedArv.toLocaleString()}.`;
        }
      }

      analysis.acquisition = {
        estimated_acquisition_cost: estimatedAcquisition,
        estimated_arv: estimatedArv,
        price_per_sqft: avgPricePerSqft,
        comp_properties: comps,
        recommendation,
      };
    }

    // Renovation analysis
    if (params.analysis_type === "renovation" || params.analysis_type === "full") {
      const reno = calculateRenovation(property);

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const scopeList = reno.scope.join(", ");
          const { text, inputTokens, outputTokens } = await callClaude(
            `You are a renovation cost estimator for Bay State Remodeling. Assess this renovation scope:\n\nProperty: ${property.address}, ${property.city}\nType: ${property.property_type}, Built: ${property.year_built}, ${property.sqft}sqft\n\nProposed scope: ${scopeList}\nEstimated cost: $${reno.estimated_renovation_cost.toLocaleString()} (includes 15% contingency of $${reno.contingency.toLocaleString()})\nEstimated timeline: ${reno.timeline_weeks} weeks\n\nProvide a 2-3 sentence assessment of this renovation plan. Note any risks or opportunities.`,
            { model: "claude-sonnet-4-20250514", maxTokens: 512 }
          );
          reno.recommendation = text.trim();
          totalTokens += inputTokens + outputTokens;
        } catch {
          reno.recommendation = `Standard renovation scope for a ${property.year_built} ${property.property_type}. Estimated at $${reno.estimated_renovation_cost.toLocaleString()} over ${reno.timeline_weeks} weeks.`;
        }
      }

      analysis.renovation = reno;
    }

    // Margin analysis
    if (params.analysis_type === "full") {
      const acqCost = analysis.acquisition?.estimated_acquisition_cost ?? property.acquisition_cost ?? 0;
      const renoCost = analysis.renovation?.estimated_renovation_cost ?? property.renovation_cost ?? 0;
      const arv = analysis.acquisition?.estimated_arv ?? 0;

      // Carrying costs: ~6 months of holding (taxes, insurance, interest)
      const carryingCosts = Math.round(acqCost * 0.04);
      // Selling costs: ~5% (agent commissions, closing)
      const sellingCosts = Math.round(arv * 0.05);
      const totalCost = acqCost + renoCost + carryingCosts + sellingCosts;
      const grossProfit = arv - totalCost;
      const roiPercentage = totalCost > 0 ? Math.round((grossProfit / totalCost) * 100) : 0;

      // Target 20% margin for suggested price
      const suggestedPrice = Math.round(totalCost * 1.2);

      let grade: "Strong" | "Viable" | "Marginal" | "Pass";
      if (roiPercentage > 20) grade = "Strong";
      else if (roiPercentage > 10) grade = "Viable";
      else if (roiPercentage > 0) grade = "Marginal";
      else grade = "Pass";

      let recommendation = "";
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const { text, inputTokens, outputTokens } = await callClaude(
            `You are a deal analyst for a real estate renovation company. Evaluate this deal:\n\nProperty: ${property.address}, ${property.city}\nAcquisition: $${acqCost.toLocaleString()}\nRenovation: $${renoCost.toLocaleString()}\nCarrying costs: $${carryingCosts.toLocaleString()}\nSelling costs: $${sellingCosts.toLocaleString()}\nTotal cost: $${totalCost.toLocaleString()}\nEstimated ARV: $${arv.toLocaleString()}\nGross profit: $${grossProfit.toLocaleString()}\nROI: ${roiPercentage}%\nDeal grade: ${grade}\n\nProvide a 2-3 sentence deal recommendation. Should the team proceed?`,
            { model: "claude-sonnet-4-20250514", maxTokens: 512 }
          );
          recommendation = text.trim();
          totalTokens += inputTokens + outputTokens;
        } catch {
          recommendation = `Deal grades as "${grade}" with ${roiPercentage}% ROI. ${grade === "Pass" ? "Recommend passing on this deal." : grade === "Strong" ? "Strong opportunity — proceed with acquisition." : "Review numbers carefully before proceeding."}`;
        }
      }

      analysis.margin = {
        acquisition_cost: acqCost,
        renovation_cost: renoCost,
        carrying_costs: carryingCosts,
        selling_costs: sellingCosts,
        total_cost: totalCost,
        estimated_arv: arv,
        gross_profit: grossProfit,
        roi_percentage: roiPercentage,
        suggested_finished_price: suggestedPrice,
        deal_grade: grade,
        recommendation,
      };

      // Update property in Supabase with analysis results
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const { createServiceClient } = await import("@/lib/supabase/server");
          const supabase = await createServiceClient();
          await supabase
            .from("properties")
            .update({
              acquisition_cost: acqCost,
              renovation_cost: renoCost,
              target_margin: roiPercentage,
              finished_price: suggestedPrice,
              renovation_score: Math.min(100, Math.max(0, roiPercentage * 2)),
            })
            .eq("id", params.property_id);
        } catch {
          // Non-fatal
        }
      }
    }

    await logAgentAction({
      agent_name: "deal-analyzer",
      action: `${params.analysis_type} analysis for ${property.address}`,
      details: analysis as unknown as Record<string, unknown>,
      property_id: params.property_id,
      status: "completed",
      tokens_used: totalTokens,
    });

    return analysis;
  });

  await logAgentAction({
    agent_name: "deal-analyzer",
    action: "run_complete",
    details: { duration_ms },
    property_id: params.property_id,
    status: "completed",
    duration_ms,
  });

  return result;
}
