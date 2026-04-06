import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import PropertyCard from "@/components/property/PropertyCard";
import RenovationConcept from "@/components/property/RenovationConcept";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import FinancingCalculator from "./FinancingCalculator";
import { getPropertyWithConcepts, getSimilarProperties } from "@/lib/data/get-data";

function formatPrice(price: number | null): string {
  if (!price) return "TBD";
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function scoreColor(score: number): "success" | "warning" | "danger" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

const typeGradients: Record<string, string> = {
  colonial: "from-amber-900/30 via-navy-lighter to-navy",
  cape: "from-sky-900/30 via-navy-lighter to-navy",
  ranch: "from-emerald-900/30 via-navy-lighter to-navy",
  "split-level": "from-violet-900/30 via-navy-lighter to-navy",
  victorian: "from-rose-900/30 via-navy-lighter to-navy",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyWithConcepts(id);
  if (!property) return { title: "Property Not Found — Projecture" };

  return {
    title: `${property.address}, ${property.neighborhood || property.city} — Projecture`,
    description: `See the renovation potential for ${property.address}. ${property.description || ""}`.slice(0, 160),
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyWithConcepts(id);

  if (!property) notFound();

  const similar = await getSimilarProperties(property, 3);
  const gradient = typeGradients[property.property_type || ""] || typeGradients.colonial;
  const primaryConcept = property.renovation_concepts[0] || null;

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

      {/* Hero */}
      <section className={`bg-gradient-to-b ${gradient} py-16`}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {property.renovation_score !== null && (
                  <Badge variant={scoreColor(property.renovation_score)} className="text-sm px-4 py-1.5">
                    {property.renovation_score} Renovation Score
                  </Badge>
                )}
                <Badge variant="default" className="capitalize">
                  {property.property_type || "Residential"}
                </Badge>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl">
                {property.address}
              </h1>
              <p className="mt-2 text-lg text-slate-light">
                {property.neighborhood && `${property.neighborhood}, `}
                {property.city}, {property.state} {property.zip}
              </p>

              <p className="mt-5 text-4xl font-bold text-copper">
                {formatPrice(property.estimated_market_value || property.listing_price)}
              </p>

              {/* Key stats */}
              <div className="mt-8 flex flex-wrap gap-8">
                {property.bedrooms && (
                  <div>
                    <span className="text-3xl font-bold">{property.bedrooms}</span>
                    <span className="ml-1.5 text-sm text-slate-light">beds</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <span className="text-3xl font-bold">{property.bathrooms}</span>
                    <span className="ml-1.5 text-sm text-slate-light">baths</span>
                  </div>
                )}
                {property.sqft && (
                  <div>
                    <span className="text-3xl font-bold">{property.sqft.toLocaleString()}</span>
                    <span className="ml-1.5 text-sm text-slate-light">sqft</span>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <span className="text-3xl font-bold">{property.year_built}</span>
                    <span className="ml-1.5 text-sm text-slate-light">built</span>
                  </div>
                )}
                {property.lot_sqft && (
                  <div>
                    <span className="text-3xl font-bold">{(property.lot_sqft / 1000).toFixed(1)}K</span>
                    <span className="ml-1.5 text-sm text-slate-light">lot sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo grid placeholder */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`bg-navy-light/60 border border-white/5 flex items-center justify-center ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
                >
                  <div className="text-center text-slate/25">
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="mx-auto">
                      <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              ))}
              <p className="col-span-2 mt-1 text-center text-xs text-slate/40">Photos coming soon</p>
            </div>
          </div>
        </Container>
      </section>

      {/* What You See Today */}
      <section className="border-t border-white/5 bg-navy-light/20 py-16">
        <Container>
          <h2 className="text-2xl font-bold">What You See Today</h2>
          {property.description && (
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-light">
              {property.description}
            </p>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {property.property_type && (
              <DetailCard label="Property Type" value={property.property_type} capitalize />
            )}
            {property.year_built && (
              <DetailCard label="Year Built" value={String(property.year_built)} />
            )}
            {property.lot_sqft && (
              <DetailCard label="Lot Size" value={`${property.lot_sqft.toLocaleString()} sqft`} />
            )}
            {property.assessed_value && (
              <DetailCard label="Assessed Value" value={formatPrice(property.assessed_value)} />
            )}
            {property.estimated_market_value && (
              <DetailCard label="Estimated Market Value" value={formatPrice(property.estimated_market_value)} />
            )}
            {property.sqft && (
              <DetailCard
                label="Price / sqft"
                value={`$${Math.round((property.estimated_market_value || property.listing_price || 0) / property.sqft).toLocaleString()}`}
              />
            )}
          </div>
        </Container>
      </section>

      {/* What It Could Become — THE CENTERPIECE */}
      <section className="py-16">
        <Container>
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">The Potential</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              What It Could Become
            </h2>
            <p className="mt-3 max-w-2xl text-slate-light">
              Renovation concepts developed by our team with cost data from 18 years of local project history.
            </p>
          </div>

          {property.renovation_concepts.length > 0 ? (
            <div className="space-y-10">
              {property.renovation_concepts.map((concept) => (
                <RenovationConcept key={concept.id} concept={concept} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-navy-light/40 p-10 text-center">
              <p className="text-lg font-semibold text-slate-light">
                Renovation concepts are being developed for this property
              </p>
              <p className="mt-2 text-sm text-slate">
                Our team is preparing detailed cost breakdowns and transformation plans. Check back soon.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Financial Summary — the money shot */}
      {primaryConcept && (
        <section className="border-t border-white/5 bg-navy-light/30 py-16">
          <Container size="md">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">The Numbers</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Financial Summary</h2>
            </div>

            <div className="mt-10 rounded-2xl border border-copper/20 bg-gradient-to-b from-copper/5 to-navy-light/40 p-8 md:p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <SummaryRow
                  label="Current Value"
                  value={formatPrice(property.estimated_market_value)}
                />
                <SummaryRow
                  label="Renovation Investment"
                  value={`${formatPrice(primaryConcept.estimated_cost_low)} – ${formatPrice(primaryConcept.estimated_cost_high)}`}
                />
                <SummaryRow
                  label="Total Investment"
                  value={`${formatPrice((property.estimated_market_value || 0) + (primaryConcept.estimated_cost_low || 0))} – ${formatPrice((property.estimated_market_value || 0) + (primaryConcept.estimated_cost_high || 0))}`}
                />
                <SummaryRow
                  label="Projected After-Renovation Value"
                  value={formatPrice(primaryConcept.estimated_arv)}
                  highlight
                />
                <SummaryRow
                  label="Potential Value Created"
                  value={`${formatPrice((primaryConcept.estimated_arv || 0) - (property.estimated_market_value || 0) - (primaryConcept.estimated_cost_high || 0))} – ${formatPrice((primaryConcept.estimated_arv || 0) - (property.estimated_market_value || 0) - (primaryConcept.estimated_cost_low || 0))}`}
                  highlight
                />
                <SummaryRow
                  label="Estimated ROI"
                  value={primaryConcept.roi_percentage ? `${primaryConcept.roi_percentage}%` : "TBD"}
                  highlight
                />
              </div>

              <p className="mt-8 text-center text-xs text-slate">
                All estimates based on 18 years of local project data. Actual costs determined after consultation.
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Financing Calculator */}
      {primaryConcept && (
        <section className="py-16">
          <Container size="md">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">Financing</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Estimate Your Payment</h2>
              <p className="mt-3 text-slate-light">
                Pre-qualified renovation financing available through our lending partners.
              </p>
            </div>

            <div className="mt-10">
              <FinancingCalculator
                purchasePrice={property.estimated_market_value || property.listing_price || 0}
                renovationBudget={Math.round(
                  ((primaryConcept.estimated_cost_low || 0) + (primaryConcept.estimated_cost_high || 0)) / 2
                )}
              />
            </div>
          </Container>
        </section>
      )}

      {/* Lead Capture */}
      <section className="border-t border-white/5 bg-navy-light/30 py-16">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Interested in This Property?</h2>
            <p className="mt-3 text-slate-light">
              Tell us about yourself and we&apos;ll reach out with more details about this property and its renovation potential.
            </p>
          </div>
          <div className="mt-8">
            <LeadCaptureForm source="property_detail" propertyId={property.id} />
          </div>
        </Container>
      </section>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold">Similar Properties</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}

function DetailCard({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-navy/60 p-4">
      <p className="text-xs text-slate">{label}</p>
      <p className={`mt-1 font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0">
      <span className="text-sm text-slate-light">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? "text-copper" : "text-warm-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
