import { callClaude, logAgentAction, timedExecution } from "./shared";
import type { Property } from "@/lib/types";

// ---------------------------------------------------------------------------
// Property Scout — identifies renovation candidate properties
// ---------------------------------------------------------------------------

interface ScoutParams {
  towns?: string[];
  min_score?: number;
  max_results?: number;
}

interface ScoutResult {
  properties_found: number;
  properties_added: number;
  details: ScoredProperty[];
}

interface ScoredProperty {
  address: string;
  city: string;
  neighborhood: string | null;
  property_type: string;
  year_built: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  assessed_value: number;
  lot_sqft: number;
  score: number;
  reasoning: string;
  added: boolean;
}

// Target towns grouped by market tier
const MARKETS = {
  primary: ["Newton", "Brookline", "Wellesley", "Needham"],
  secondary: ["Lexington", "Weston", "Cambridge", "Watertown", "Waltham"],
  expansion: ["Natick", "Dover", "Sherborn", "Wayland", "Sudbury", "Concord"],
};

const ALL_TOWNS = [...MARKETS.primary, ...MARKETS.secondary, ...MARKETS.expansion];

function scoreProperty(p: Property): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Age — pre-1970 scores higher
  if (p.year_built) {
    if (p.year_built < 1940) {
      score += 25;
      factors.push(`Pre-1940 build (${p.year_built}) — high renovation potential`);
    } else if (p.year_built < 1970) {
      score += 20;
      factors.push(`Mid-century build (${p.year_built}) — strong renovation candidate`);
    } else if (p.year_built < 1990) {
      score += 10;
      factors.push(`1970s-80s build (${p.year_built}) — moderate update potential`);
    }
  }

  // Property type — colonials and capes score highest
  const type = (p.property_type ?? "").toLowerCase();
  if (type.includes("colonial")) {
    score += 20;
    factors.push("Colonial — highest demand in target markets");
  } else if (type.includes("cape")) {
    score += 18;
    factors.push("Cape — strong demand, great expansion potential");
  } else if (type.includes("victorian")) {
    score += 15;
    factors.push("Victorian — premium character, high ARV ceiling");
  } else if (type.includes("ranch")) {
    score += 12;
    factors.push("Ranch — single-level appeal, good for open-concept");
  } else if (type.includes("split")) {
    score += 10;
    factors.push("Split-level — moderate demand, layout flexibility");
  }

  // Assessed value vs. lot potential
  if (p.assessed_value && p.sqft) {
    const pricePerSqft = p.assessed_value / p.sqft;
    if (pricePerSqft < 300) {
      score += 15;
      factors.push(`Low $/sqft ($${Math.round(pricePerSqft)}) — below market, renovation upside`);
    } else if (pricePerSqft < 400) {
      score += 10;
      factors.push(`Moderate $/sqft ($${Math.round(pricePerSqft)}) — room for value-add`);
    }
  }

  // Lot size relative to home — expansion potential
  if (p.lot_sqft && p.sqft) {
    const ratio = p.lot_sqft / p.sqft;
    if (ratio > 8) {
      score += 15;
      factors.push(`Large lot ratio (${ratio.toFixed(1)}x) — strong expansion potential`);
    } else if (ratio > 5) {
      score += 8;
      factors.push(`Good lot ratio (${ratio.toFixed(1)}x) — some expansion room`);
    }
  }

  // Bedroom count — 3BR is perfect for renovation to 4-5BR
  if (p.bedrooms) {
    if (p.bedrooms <= 3) {
      score += 10;
      factors.push(`${p.bedrooms}BR — ideal for bedroom addition during renovation`);
    }
  }

  // Town tier bonus
  if (MARKETS.primary.includes(p.city)) {
    score += 10;
    factors.push("Primary market — highest demand and ARV potential");
  } else if (MARKETS.secondary.includes(p.city)) {
    score += 5;
    factors.push("Secondary market — strong demand");
  }

  return { score: Math.min(score, 100), factors };
}

export async function runPropertyScout(params: ScoutParams = {}): Promise<ScoutResult> {
  const towns = params.towns?.length ? params.towns : ALL_TOWNS;
  const minScore = params.min_score ?? 50;
  const maxResults = params.max_results ?? 10;

  const { result, duration_ms } = await timedExecution(async () => {
    // Fetch all properties from Supabase to scan
    let allProperties: Property[] = [];

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = await createServiceClient();
        const { data } = await supabase
          .from("properties")
          .select("*")
          .in("city", towns)
          .order("created_at", { ascending: false });
        allProperties = (data ?? []) as Property[];
      } catch {
        // Fall through to seed data
      }
    }

    // If no Supabase data, use seed data
    if (allProperties.length === 0) {
      const seedData = await import("@/lib/data/seed-data.json");
      allProperties = (seedData.properties as unknown as Property[]).filter(
        (p) => towns.includes(p.city)
      );
    }

    // Score all properties
    const scored: ScoredProperty[] = allProperties
      .map((p) => {
        const { score, factors } = scoreProperty(p);
        return {
          address: p.address,
          city: p.city,
          neighborhood: p.neighborhood,
          property_type: p.property_type ?? "Unknown",
          year_built: p.year_built ?? 0,
          sqft: p.sqft ?? 0,
          bedrooms: p.bedrooms ?? 0,
          bathrooms: p.bathrooms ?? 0,
          assessed_value: p.assessed_value ?? 0,
          lot_sqft: p.lot_sqft ?? 0,
          score,
          reasoning: factors.join("; "),
          added: false,
        };
      })
      .filter((p) => p.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    // Use Claude to generate a brief analysis note for top candidates
    let totalTokens = 0;
    if (scored.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        const propertyList = scored
          .slice(0, 5)
          .map(
            (p, i) =>
              `${i + 1}. ${p.address}, ${p.city} — ${p.property_type}, ${p.year_built}, ${p.sqft}sqft, ${p.bedrooms}BR, assessed $${p.assessed_value?.toLocaleString()}, lot ${p.lot_sqft?.toLocaleString()}sqft, score: ${p.score}`
          )
          .join("\n");

        const { text, inputTokens, outputTokens } = await callClaude(
          `You are a real estate acquisition analyst for a company that buys, renovates, and sells homes in the Greater Boston / MetroWest area. Review these property candidates and provide a 1-2 sentence scout note for each explaining WHY this property is a good renovation candidate:\n\n${propertyList}\n\nRespond in JSON format: { "notes": ["note1", "note2", ...] }`,
          { model: "claude-haiku-4-5-20251001", maxTokens: 1024 }
        );
        totalTokens = inputTokens + outputTokens;

        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const notes = parsed.notes as string[];
            notes.forEach((note, i) => {
              if (scored[i]) {
                scored[i].reasoning = note;
              }
            });
          }
        } catch {
          // Keep the algorithmic reasoning
        }
      } catch {
        // Continue without Claude enhancement
      }
    }

    // Add qualifying properties to Supabase as intake if not already there
    let addedCount = 0;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = await createServiceClient();

        for (const sp of scored) {
          // Check if property already exists
          const { data: existing } = await supabase
            .from("properties")
            .select("id")
            .eq("address", sp.address)
            .eq("city", sp.city)
            .limit(1);

          if (!existing || existing.length === 0) {
            const { error } = await supabase.from("properties").insert({
              address: sp.address,
              city: sp.city,
              state: "MA",
              neighborhood: sp.neighborhood,
              property_type: sp.property_type,
              year_built: sp.year_built || null,
              sqft: sp.sqft || null,
              bedrooms: sp.bedrooms || null,
              bathrooms: sp.bathrooms || null,
              lot_sqft: sp.lot_sqft || null,
              assessed_value: sp.assessed_value || null,
              renovation_score: sp.score,
              property_status: "intake",
              sarina_notes: `[Scout] ${sp.reasoning}`,
            });
            if (!error) {
              sp.added = true;
              addedCount++;
            }
          }
        }
      } catch {
        // Continue — properties just won't be added
      }
    }

    await logAgentAction({
      agent_name: "property-scout",
      action: `Scanned ${allProperties.length} properties in ${towns.join(", ")}`,
      details: {
        towns,
        min_score: minScore,
        properties_scanned: allProperties.length,
        properties_qualifying: scored.length,
        properties_added: addedCount,
      },
      status: "completed",
      tokens_used: totalTokens,
    });

    return {
      properties_found: scored.length,
      properties_added: addedCount,
      details: scored,
    };
  });

  await logAgentAction({
    agent_name: "property-scout",
    action: "run_complete",
    details: { duration_ms, ...result },
    status: "completed",
    duration_ms,
  });

  return result;
}
