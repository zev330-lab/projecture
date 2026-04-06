import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import RenovationConcept from "@/components/property/RenovationConcept";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import type { PropertyWithConcepts } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "Price TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

async function getProperty(id: string): Promise<PropertyWithConcepts | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: property } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (!property) return null;

    const { data: concepts } = await supabase
      .from("renovation_concepts")
      .select("*")
      .eq("property_id", id)
      .eq("status", "published")
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

    return { ...property, renovation_concepts: conceptsWithCosts } as PropertyWithConcepts;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property Not Found — Projecture" };

  return {
    title: `${property.address}, ${property.city} — Projecture`,
    description: `See the renovation potential for ${property.address}. ${property.description || ""}`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="pt-24">
      {/* Breadcrumb */}
      <section className="border-b border-white/5 py-4">
        <Container>
          <div className="flex items-center gap-2 text-sm text-slate">
            <Link href="/properties" className="transition-colors hover:text-warm-white">
              Properties
            </Link>
            <span>/</span>
            <span className="text-slate-light">{property.address}</span>
          </div>
        </Container>
      </section>

      {/* Property Header */}
      <section className="py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {property.listing_status && (
                  <Badge variant={property.listing_status === "active" ? "success" : "copper"}>
                    {property.listing_status === "coming_soon" ? "Coming Soon" : property.listing_status}
                  </Badge>
                )}
                {property.renovation_score !== null && (
                  <Badge variant="copper">Reno Score: {property.renovation_score}</Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                {property.address}
              </h1>
              <p className="mt-2 text-lg text-slate-light">
                {property.city}, {property.state} {property.zip}
                {property.neighborhood && ` — ${property.neighborhood}`}
              </p>

              <p className="mt-4 text-3xl font-bold text-copper">
                {formatPrice(property.listing_price)}
              </p>

              {/* Key stats */}
              <div className="mt-6 flex flex-wrap gap-6 text-sm">
                {property.bedrooms && (
                  <div>
                    <span className="text-2xl font-bold text-warm-white">{property.bedrooms}</span>
                    <span className="ml-1 text-slate-light">beds</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <span className="text-2xl font-bold text-warm-white">{property.bathrooms}</span>
                    <span className="ml-1 text-slate-light">baths</span>
                  </div>
                )}
                {property.sqft && (
                  <div>
                    <span className="text-2xl font-bold text-warm-white">{property.sqft.toLocaleString()}</span>
                    <span className="ml-1 text-slate-light">sqft</span>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <span className="text-2xl font-bold text-warm-white">{property.year_built}</span>
                    <span className="ml-1 text-slate-light">built</span>
                  </div>
                )}
                {property.lot_sqft && (
                  <div>
                    <span className="text-2xl font-bold text-warm-white">{property.lot_sqft.toLocaleString()}</span>
                    <span className="ml-1 text-slate-light">lot sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo placeholder */}
            <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-navy-lighter to-navy-light border border-white/5 flex items-center justify-center">
              <div className="text-center text-slate/40">
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" className="mx-auto">
                  <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <p className="mt-2 text-xs">Photos coming soon</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Current State */}
      {property.description && (
        <section className="border-t border-white/5 bg-navy-light/30 py-16">
          <Container>
            <h2 className="text-2xl font-bold">About This Property</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-light">
              {property.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {property.property_type && (
                <div className="rounded-lg border border-white/5 bg-navy/60 p-4">
                  <p className="text-xs text-slate">Property Type</p>
                  <p className="mt-1 font-semibold capitalize">{property.property_type}</p>
                </div>
              )}
              {property.assessed_value && (
                <div className="rounded-lg border border-white/5 bg-navy/60 p-4">
                  <p className="text-xs text-slate">Assessed Value</p>
                  <p className="mt-1 font-semibold">{formatPrice(property.assessed_value)}</p>
                </div>
              )}
              {property.days_on_market !== null && (
                <div className="rounded-lg border border-white/5 bg-navy/60 p-4">
                  <p className="text-xs text-slate">Days on Market</p>
                  <p className="mt-1 font-semibold">{property.days_on_market}</p>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Renovation Concepts */}
      <section className="py-16">
        <Container>
          <h2 className="text-2xl font-bold">The Potential</h2>
          <p className="mt-2 text-slate-light">
            Renovation concepts developed by our team with real cost data.
          </p>

          {property.renovation_concepts.length > 0 ? (
            <div className="mt-8 space-y-8">
              {property.renovation_concepts.map((concept) => (
                <RenovationConcept key={concept.id} concept={concept} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-white/5 bg-navy-light/40 p-8 text-center">
              <p className="text-slate-light">
                Renovation concepts are being developed for this property. Check back soon.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Interest CTA */}
      <section className="border-t border-white/5 bg-navy-light/30 py-16">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Interested in This Property?</h2>
            <p className="mt-3 text-slate-light">
              Tell us about yourself and we&apos;ll reach out with more details.
            </p>
          </div>
          <div className="mt-8">
            <LeadCaptureForm source="property_detail" propertyId={property.id} />
          </div>
        </Container>
      </section>
    </main>
  );
}
