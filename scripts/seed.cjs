/**
 * Seed script for Projecture — inserts properties, concepts, and cost items into Supabase.
 *
 * Usage: source .env.local && node scripts/seed.cjs
 */

const { createClient } = require("@supabase/supabase-js");
const seedData = require("../src/lib/data/seed-data.json");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log("Starting seed...\n");

  // 1. Clear existing data (in reverse FK order)
  console.log("Clearing existing data...");
  await supabase.from("cost_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("renovation_concepts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("properties").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("  Done.\n");

  // 2. Insert properties
  console.log("Inserting properties...");
  const { data: insertedProperties, error: propError } = await supabase
    .from("properties")
    .insert(seedData.properties)
    .select();

  if (propError) {
    console.error("Property insert error:", propError);
    process.exit(1);
  }
  console.log(`  Inserted ${insertedProperties.length} properties.\n`);

  // 3. Insert concepts and cost items for featured properties
  console.log("Inserting renovation concepts and cost items...");
  let conceptCount = 0;
  let costItemCount = 0;

  for (const conceptGroup of seedData.concepts) {
    const property = insertedProperties[conceptGroup.property_index];
    if (!property) {
      console.error(`  No property at index ${conceptGroup.property_index}`);
      continue;
    }

    for (const concept of conceptGroup.concepts) {
      // Insert concept
      const { data: insertedConcept, error: conceptError } = await supabase
        .from("renovation_concepts")
        .insert({
          property_id: property.id,
          title: concept.title,
          description: concept.description,
          scope: concept.scope,
          estimated_cost_low: concept.estimated_cost_low,
          estimated_cost_high: concept.estimated_cost_high,
          estimated_timeline_weeks: concept.estimated_timeline_weeks,
          estimated_arv: concept.estimated_arv,
          roi_percentage: concept.roi_percentage,
          status: concept.status,
        })
        .select()
        .single();

      if (conceptError) {
        console.error(`  Concept insert error for "${concept.title}":`, conceptError);
        continue;
      }
      conceptCount++;

      // Determine which cost templates to use based on scope
      const costItems = [];
      for (const scopeItem of concept.scope) {
        const templateKey = scopeItem === "primary_bath" ? "primary_bath"
          : scopeItem === "guest_bath" ? "guest_bath"
          : scopeItem === "powder_room" ? "guest_bath"
          : scopeItem === "second_floor" ? "primary_bath"
          : scopeItem === "lower_level" ? "basement"
          : scopeItem;

        const template = seedData.cost_templates[templateKey];
        if (template) {
          for (const item of template) {
            costItems.push({
              concept_id: insertedConcept.id,
              ...item,
            });
          }
        }
      }

      if (costItems.length > 0) {
        const { error: costError } = await supabase
          .from("cost_items")
          .insert(costItems);

        if (costError) {
          console.error(`  Cost items error for "${concept.title}":`, costError);
        } else {
          costItemCount += costItems.length;
        }
      }
    }
  }

  console.log(`  Inserted ${conceptCount} concepts with ${costItemCount} cost items.\n`);

  // Summary
  console.log("=== Seed Complete ===");
  console.log(`Properties: ${insertedProperties.length}`);
  console.log(`Concepts: ${conceptCount}`);
  console.log(`Cost Items: ${costItemCount}`);
  console.log(`Featured: ${insertedProperties.filter(p => p.featured).length}`);
}

seed().catch(console.error);
