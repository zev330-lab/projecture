import type { Property, PropertyWithConcepts, RenovationConcept, CostItem } from "@/lib/types";
import seedData from "./seed-data.json";

// Generate deterministic UUIDs from index for fallback data
function fakeId(prefix: string, index: number): string {
  return `${prefix}-0000-0000-0000-${String(index).padStart(12, "0")}`;
}

function getFallbackProperties(): Property[] {
  return (seedData.properties as Record<string, unknown>[]).map((p, i) => ({
    ...(p as Omit<Property, "id" | "mls_number" | "days_on_market" | "photos" | "created_at" | "updated_at">),
    id: fakeId("prop", i),
    mls_number: null,
    days_on_market: null,
    photos: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as Property[];
}

function getFallbackPropertyWithConcepts(id: string): PropertyWithConcepts | null {
  const properties = getFallbackProperties();
  const property = properties.find((p) => p.id === id);
  if (!property) return null;

  const propIndex = properties.indexOf(property);
  const conceptGroup = seedData.concepts.find((c) => c.property_index === propIndex);

  const concepts: (RenovationConcept & { cost_items: CostItem[] })[] = (
    conceptGroup?.concepts || []
  ).map((c, ci) => {
    const conceptId = fakeId("conc", propIndex * 10 + ci);
    const costItems: CostItem[] = [];

    for (const scopeItem of c.scope) {
      const templateKey =
        scopeItem === "primary_bath" ? "primary_bath"
          : scopeItem === "guest_bath" ? "guest_bath"
          : scopeItem === "powder_room" ? "guest_bath"
          : scopeItem === "second_floor" ? "primary_bath"
          : scopeItem === "lower_level" ? "basement"
          : scopeItem;

      const template = (seedData.cost_templates as Record<string, typeof seedData.cost_templates.kitchen_full>)[templateKey];
      if (template) {
        template.forEach((item, ii) => {
          costItems.push({
            id: fakeId("cost", propIndex * 1000 + ci * 100 + costItems.length + ii),
            concept_id: conceptId,
            category: item.category,
            item_name: item.item_name,
            item_type: item.item_type as CostItem["item_type"],
            cost_low: item.cost_low,
            cost_high: item.cost_high,
            unit: item.unit,
            quantity: item.quantity,
            notes: null,
            created_at: new Date().toISOString(),
          });
        });
      }
    }

    return {
      id: conceptId,
      property_id: property.id,
      title: c.title,
      description: c.description,
      scope: c.scope,
      estimated_cost_low: c.estimated_cost_low,
      estimated_cost_high: c.estimated_cost_high,
      estimated_timeline_weeks: c.estimated_timeline_weeks,
      estimated_arv: c.estimated_arv,
      roi_percentage: c.roi_percentage,
      render_urls: null,
      floor_plan_url: null,
      status: c.status as RenovationConcept["status"],
      created_by: null,
      approved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cost_items: costItems,
    };
  });

  return { ...property, renovation_concepts: concepts };
}

/** Get all published properties (public-facing) */
export async function getProperties(): Promise<Property[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackProperties().filter(
      (p) => p.property_status === "published" || p.property_status === "under_contract" || p.property_status === "sold"
    );
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .in("property_status", ["published", "under_contract", "sold"])
      .order("finished_price", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackProperties().filter(
        (p) => p.property_status === "published" || p.property_status === "under_contract" || p.property_status === "sold"
      );
    }
    return data as Property[];
  } catch {
    return getFallbackProperties().filter(
      (p) => p.property_status === "published" || p.property_status === "under_contract" || p.property_status === "sold"
    );
  }
}

/** Get featured/published properties for homepage */
export async function getFeaturedProperties(): Promise<Property[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackProperties().filter((p) => p.property_status === "published");
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("property_status", "published")
      .order("finished_price", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackProperties().filter((p) => p.property_status === "published");
    }
    return data as Property[];
  } catch {
    return getFallbackProperties().filter((p) => p.property_status === "published");
  }
}

/** Get all properties for dashboard (all statuses) */
export async function getAllProperties(): Promise<Property[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackProperties();
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getFallbackProperties();
    }
    return data as Property[];
  } catch {
    return getFallbackProperties();
  }
}

export async function getPropertyWithConcepts(
  id: string
): Promise<PropertyWithConcepts | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getFallbackPropertyWithConcepts(id);
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (propError || !property) {
      return getFallbackPropertyWithConcepts(id);
    }

    const { data: concepts } = await supabase
      .from("renovation_concepts")
      .select("*")
      .eq("property_id", id)
      .order("created_at", { ascending: false });

    const conceptsWithCosts = await Promise.all(
      (concepts || []).map(async (concept) => {
        const { data: costItems } = await supabase
          .from("cost_items")
          .select("*")
          .eq("concept_id", concept.id)
          .order("category");

        return { ...concept, cost_items: costItems || [] };
      })
    );

    return {
      ...property,
      renovation_concepts: conceptsWithCosts,
    } as PropertyWithConcepts;
  } catch {
    return getFallbackPropertyWithConcepts(id);
  }
}

export async function getSimilarProperties(
  property: Property,
  limit: number = 3
): Promise<Property[]> {
  const all = await getProperties();
  return all
    .filter(
      (p) =>
        p.id !== property.id &&
        (p.neighborhood === property.neighborhood ||
          Math.abs((p.finished_price || 0) - (property.finished_price || 0)) < 400000)
    )
    .slice(0, limit);
}
