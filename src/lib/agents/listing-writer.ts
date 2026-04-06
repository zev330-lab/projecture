import { callClaude, logAgentAction, timedExecution } from "./shared";
import type { Property } from "@/lib/types";

// ---------------------------------------------------------------------------
// Listing Writer — generates compelling listing copy
// ---------------------------------------------------------------------------

interface ListingWriterParams {
  property_id: string;
  output_types?: string[];
  style_notes?: string;
}

interface ListingOutput {
  teaser: string;
  full_description: string;
  features: string[];
  social_post: string;
  email: string;
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

  const seedData = await import("@/lib/data/seed-data.json");
  const props = seedData.properties as unknown as Property[];
  return props.find((p) => p.id === propertyId) ?? null;
}

export async function runListingWriter(params: ListingWriterParams): Promise<ListingOutput> {
  const outputTypes = params.output_types ?? ["teaser", "full_description", "features", "social_post", "email"];

  const { result, duration_ms } = await timedExecution(async () => {
    const property = await fetchProperty(params.property_id);
    if (!property) {
      throw new Error(`Property ${params.property_id} not found`);
    }

    const neighborhoodStr = property.neighborhood ? ` in ${property.neighborhood}` : "";
    const readyDate = property.estimated_ready_date
      ? new Date(property.estimated_ready_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "2025";

    const propertyContext = `
Property: ${property.address}, ${property.city}${neighborhoodStr}
Type: ${property.property_type}
Finished specs: ${property.finished_beds ?? property.bedrooms}BR / ${property.finished_baths ?? property.bathrooms}BA / ${(property.finished_sqft ?? property.sqft)?.toLocaleString()}sqft
Finished price: $${property.finished_price?.toLocaleString() ?? "TBD"}
Ready: ${readyDate}
Current specs: ${property.bedrooms}BR / ${property.bathrooms}BA / ${property.sqft?.toLocaleString()}sqft
Year built: ${property.year_built}
Lot: ${property.lot_sqft?.toLocaleString()}sqft
Included features: ${property.included_features?.join(", ") ?? "Premium kitchen, updated bathrooms, hardwood floors, new systems"}
${params.style_notes ? `Style notes: ${params.style_notes}` : ""}
`.trim();

    let totalTokens = 0;
    let output: ListingOutput = {
      teaser: "",
      full_description: "",
      features: [],
      social_post: "",
      email: "",
    };

    if (!process.env.ANTHROPIC_API_KEY) {
      // Fallback: generate without Claude
      output = {
        teaser: `Stunning ${property.finished_beds ?? property.bedrooms}BR ${property.property_type} in ${property.neighborhood ?? property.city} — completely reimagined and delivered turnkey.`,
        full_description: `Welcome to ${property.address}, a beautifully reimagined ${property.property_type} in the heart of ${property.neighborhood ?? property.city}. This ${(property.finished_sqft ?? property.sqft)?.toLocaleString()}-square-foot home has been thoughtfully renovated from top to bottom, blending classic New England charm with modern luxury.\n\nThe open-concept main level features a chef's kitchen with premium cabinetry, quartz countertops, and high-end appliances flowing seamlessly into a sun-drenched living space. Upstairs, ${property.finished_beds ?? property.bedrooms} generous bedrooms offer retreat-like comfort, anchored by a primary suite with spa-inspired bathroom.\n\nEvery detail has been considered — from gleaming hardwood floors throughout to brand-new mechanical systems ensuring efficiency and comfort for years to come. Set on a ${((property.lot_sqft ?? 0) / 43560).toFixed(2)}-acre lot, this is turnkey living at its finest.\n\nReady ${readyDate}. Priced at $${property.finished_price?.toLocaleString()}.`,
        features: [
          "Chef's kitchen with premium cabinetry and quartz countertops",
          "Spa-inspired primary bathroom",
          "Gleaming hardwood floors throughout",
          "Brand-new HVAC and electrical systems",
          "Energy-efficient windows",
          "Professional landscaping",
          "Finished lower level",
          "Fresh interior and exterior paint",
        ],
        social_post: `COMING SOON: ${property.address}, ${property.neighborhood ?? property.city} 🏡\n\n${property.finished_beds ?? property.bedrooms}BR | ${property.finished_baths ?? property.bathrooms}BA | ${(property.finished_sqft ?? property.sqft)?.toLocaleString()}sqft\n$${property.finished_price?.toLocaleString()}\n\nCompletely reimagined and delivered turnkey. Every detail — from the chef's kitchen to the spa-like bathrooms — has been thoughtfully selected.\n\nReady ${readyDate}. Link in bio.\n\n#Projecture #NewtonMA #TurnkeyLiving #RenovatedHome`,
        email: `Subject: Just Listed — ${property.address}, ${property.neighborhood ?? property.city}\n\nA stunning opportunity has just been listed in ${property.neighborhood ?? property.city}.\n\n${property.address} is a fully reimagined ${(property.finished_sqft ?? property.sqft)?.toLocaleString()}-sqft ${property.property_type} featuring ${property.finished_beds ?? property.bedrooms} bedrooms, ${property.finished_baths ?? property.bathrooms} bathrooms, and every modern upgrade you could want — delivered completely turnkey.\n\nPriced at $${property.finished_price?.toLocaleString()} | Ready ${readyDate}\n\nWould you like to schedule a preview? Reply to this email or visit projecture.vercel.app to learn more.\n\nBest,\nThe Projecture Team`,
      };
      return output;
    }

    const requestedTypes = outputTypes.join(", ");

    const { text, inputTokens, outputTokens } = await callClaude(
      `You are a luxury real estate copywriter for Projecture, a company that sells fully renovated, turnkey homes in the Greater Boston area. Write compelling listing content for this property.

${propertyContext}

Generate the following (requested: ${requestedTypes}):

1. **teaser**: A single compelling line for property cards, max 120 characters. Sell the lifestyle.
2. **full_description**: 3-4 paragraph narrative for the property detail page. Sell the LIFESTYLE, not the renovation process. Never mention "fixer-upper", renovation costs, or construction. Write as if the home already exists in its finished state. Use sensory language: light, warmth, flow. Premium real estate voice — aspirational, specific, warm.
3. **features**: Array of 8-10 "what's included" checklist items. Each should be specific and premium-sounding (e.g., "Chef's kitchen with premium cabinetry and quartz countertops").
4. **social_post**: Instagram/Facebook post for the listing. Include relevant hashtags.
5. **email**: Email announcement for interested buyers. Include subject line.

Respond in JSON format:
{
  "teaser": "...",
  "full_description": "...",
  "features": ["...", "..."],
  "social_post": "...",
  "email": "..."
}`,
      { model: "claude-opus-4-0-20250514", maxTokens: 3000, temperature: 0.8 }
    );

    totalTokens = inputTokens + outputTokens;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        output = {
          teaser: parsed.teaser ?? output.teaser,
          full_description: parsed.full_description ?? output.full_description,
          features: parsed.features ?? output.features,
          social_post: parsed.social_post ?? output.social_post,
          email: parsed.email ?? output.email,
        };
      }
    } catch {
      // Claude response wasn't valid JSON — try to extract parts
      output.full_description = text;
    }

    // Optionally save to property
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = await createServiceClient();
        await supabase
          .from("properties")
          .update({
            teaser_description: output.teaser,
            full_description: output.full_description,
            included_features: output.features,
          })
          .eq("id", params.property_id);
      } catch {
        // Non-fatal
      }
    }

    await logAgentAction({
      agent_name: "listing-writer",
      action: `Generated listing copy for ${property.address}`,
      details: {
        property_id: params.property_id,
        output_types: outputTypes,
        teaser_length: output.teaser.length,
        description_length: output.full_description.length,
        features_count: output.features.length,
      },
      property_id: params.property_id,
      status: "completed",
      tokens_used: totalTokens,
    });

    return output;
  });

  await logAgentAction({
    agent_name: "listing-writer",
    action: "run_complete",
    details: { duration_ms },
    property_id: params.property_id,
    status: "completed",
    duration_ms,
  });

  return result;
}
