import { callClaude, logAgentAction, timedExecution } from "./shared";
import type { Property, Lead, BuyerProfile } from "@/lib/types";

// ---------------------------------------------------------------------------
// Buyer Matchmaker — matches qualified buyers to published properties
// ---------------------------------------------------------------------------

interface MatchmakerParams {
  lead_id?: string;
}

interface BuyerMatch {
  lead_id: string;
  lead_name: string;
  property_id: string;
  property_address: string;
  score: number;
  recommendation: string;
}

interface MatchResult {
  matches: BuyerMatch[];
  buyers_evaluated: number;
  properties_evaluated: number;
}

interface BuyerWithProfile extends Lead {
  profile: BuyerProfile | null;
}

function scoreMatch(buyer: BuyerWithProfile, property: Property): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  const profile = buyer.profile;

  // Price within budget
  const price = property.finished_price ?? 0;
  const budgetMin = buyer.budget_min ?? profile?.budget_min ?? 0;
  const budgetMax = buyer.budget_max ?? profile?.budget_max ?? Infinity;

  if (price >= budgetMin && price <= budgetMax) {
    score += 25;
    factors.push("Within budget range");
  } else if (price > budgetMax) {
    const overBy = ((price - budgetMax) / budgetMax) * 100;
    if (overBy < 10) {
      score += 10;
      factors.push(`Slightly over budget (${overBy.toFixed(0)}%)`);
    } else {
      return { score: 0, factors: ["Over budget"] };
    }
  }

  // Town match
  const targetTowns = buyer.target_towns ?? profile?.target_towns ?? [];
  if (targetTowns.length === 0 || targetTowns.some((t) => t.toLowerCase() === property.city.toLowerCase())) {
    score += 20;
    if (targetTowns.length > 0) factors.push(`Target town match: ${property.city}`);
  }

  // Bedroom match
  const bedsMin = buyer.bedrooms_min ?? profile?.bedrooms_min ?? 0;
  const propertyBeds = property.finished_beds ?? property.bedrooms ?? 0;
  if (propertyBeds >= bedsMin) {
    score += 15;
    factors.push(`${propertyBeds}BR meets ${bedsMin}BR minimum`);
  }

  // Bathroom match
  const bathsMin = profile?.bathrooms_min ?? 0;
  const propertyBaths = property.finished_baths ?? property.bathrooms ?? 0;
  if (propertyBaths >= bathsMin) {
    score += 10;
    if (bathsMin > 0) factors.push(`${propertyBaths}BA meets ${bathsMin}BA minimum`);
  }

  // Property type match
  const preferredTypes = profile?.property_types ?? [];
  if (
    preferredTypes.length === 0 ||
    preferredTypes.some((t) => property.property_type?.toLowerCase().includes(t.toLowerCase()))
  ) {
    score += 10;
    if (preferredTypes.length > 0) factors.push(`Preferred type: ${property.property_type}`);
  }

  // Must-haves
  const mustHaves = profile?.must_haves ?? [];
  const features = property.included_features ?? [];
  if (mustHaves.length > 0) {
    const matchedMustHaves = mustHaves.filter((mh) =>
      features.some((f) => f.toLowerCase().includes(mh.toLowerCase()))
    );
    if (matchedMustHaves.length > 0) {
      score += 10 * (matchedMustHaves.length / mustHaves.length);
      factors.push(`Must-haves matched: ${matchedMustHaves.join(", ")}`);
    }
  }

  // Timeline alignment
  if (profile?.timeline && property.estimated_ready_date) {
    score += 5;
    factors.push("Timeline aligns");
  }

  // Neighborhood bonus
  if (property.neighborhood) {
    score += 5;
    factors.push(`Village: ${property.neighborhood}`);
  }

  return { score: Math.min(Math.round(score), 100), factors };
}

export async function runBuyerMatchmaker(params: MatchmakerParams = {}): Promise<MatchResult> {
  const { result, duration_ms } = await timedExecution(async () => {
    let buyers: BuyerWithProfile[] = [];
    let properties: Property[] = [];

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = await createServiceClient();

        // Fetch qualified leads (or a specific lead)
        let leadsQuery = supabase.from("leads").select("*");
        if (params.lead_id) {
          leadsQuery = leadsQuery.eq("id", params.lead_id);
        } else {
          leadsQuery = leadsQuery.eq("status", "qualified");
        }
        const { data: leadsData } = await leadsQuery;
        const leads = (leadsData ?? []) as Lead[];

        // Fetch buyer profiles for those leads
        const leadIds = leads.map((l) => l.id);
        const { data: profilesData } = await supabase
          .from("buyer_profiles")
          .select("*")
          .in("lead_id", leadIds);
        const profiles = (profilesData ?? []) as BuyerProfile[];

        buyers = leads.map((lead) => ({
          ...lead,
          profile: profiles.find((p) => p.lead_id === lead.id) ?? null,
        }));

        // Fetch published properties
        const { data: propsData } = await supabase
          .from("properties")
          .select("*")
          .in("property_status", ["published", "approved"]);
        properties = (propsData ?? []) as Property[];
      } catch {
        // Fall through
      }
    }

    // Fallback: use seed data for demo
    if (properties.length === 0) {
      const seedData = await import("@/lib/data/seed-data.json");
      properties = (seedData.properties as unknown as Property[]).filter(
        (p) => p.property_status === "published" || p.property_status === "approved"
      );
    }

    if (buyers.length === 0) {
      // Create demo buyer for testing
      buyers = [
        {
          id: "demo-buyer-1",
          first_name: "Demo",
          last_name: "Buyer",
          email: "demo@example.com",
          phone: null,
          interest: "buying",
          target_towns: ["Newton"],
          budget_min: 800000,
          budget_max: 1500000,
          bedrooms_min: 3,
          notes: null,
          source: "demo",
          status: "qualified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: {
            id: "demo-profile-1",
            lead_id: "demo-buyer-1",
            target_towns: ["Newton", "Brookline"],
            property_types: ["Colonial", "Cape"],
            budget_min: 800000,
            budget_max: 1500000,
            renovation_budget_max: null,
            bedrooms_min: 3,
            bathrooms_min: 2,
            must_haves: ["kitchen", "hardwood"],
            nice_to_haves: ["basement", "garage"],
            deal_breakers: null,
            timeline: "6 months",
            financing_type: "conventional",
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];
    }

    // Score all buyer-property combinations
    const allMatches: BuyerMatch[] = [];

    for (const buyer of buyers) {
      for (const property of properties) {
        const { score, factors } = scoreMatch(buyer, property);
        if (score >= 30) {
          allMatches.push({
            lead_id: buyer.id,
            lead_name: `${buyer.first_name} ${buyer.last_name ?? ""}`.trim(),
            property_id: property.id,
            property_address: `${property.address}, ${property.city}`,
            score,
            recommendation: factors.join(". ") + ".",
          });
        }
      }
    }

    // Sort by score descending
    allMatches.sort((a, b) => b.score - a.score);

    // Enhance top matches with Claude recommendations
    let totalTokens = 0;
    if (allMatches.length > 0 && process.env.ANTHROPIC_API_KEY) {
      const topMatches = allMatches.slice(0, 5);
      try {
        const matchList = topMatches
          .map(
            (m, i) =>
              `${i + 1}. Buyer: ${m.lead_name} → Property: ${m.property_address} (Score: ${m.score}) — ${m.recommendation}`
          )
          .join("\n");

        const { text, inputTokens, outputTokens } = await callClaude(
          `You are a real estate matchmaker. For each buyer-property match below, write a personalized 1-2 sentence recommendation explaining why this property is perfect for this buyer. Be warm and specific.\n\n${matchList}\n\nRespond in JSON: { "recommendations": ["rec1", "rec2", ...] }`,
          { model: "claude-haiku-4-5-20251001", maxTokens: 1024 }
        );
        totalTokens = inputTokens + outputTokens;

        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const recs = parsed.recommendations as string[];
            recs.forEach((rec, i) => {
              if (topMatches[i]) topMatches[i].recommendation = rec;
            });
          }
        } catch {
          // Keep algorithmic recommendations
        }
      } catch {
        // Continue without enhancement
      }
    }

    await logAgentAction({
      agent_name: "buyer-matchmaker",
      action: `Matched ${buyers.length} buyers against ${properties.length} properties`,
      details: {
        buyers_evaluated: buyers.length,
        properties_evaluated: properties.length,
        matches_found: allMatches.length,
        top_score: allMatches[0]?.score ?? 0,
      },
      status: "completed",
      tokens_used: totalTokens,
    });

    return {
      matches: allMatches.slice(0, 20),
      buyers_evaluated: buyers.length,
      properties_evaluated: properties.length,
    };
  });

  await logAgentAction({
    agent_name: "buyer-matchmaker",
    action: "run_complete",
    details: { duration_ms, ...result },
    status: "completed",
    duration_ms,
  });

  return result;
}
