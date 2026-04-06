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

const typeColors: Record<string, string> = {
  colonial: "from-amber-50 to-cream",
  cape: "from-sky-50 to-cream",
  ranch: "from-emerald-50 to-cream",
  "split-level": "from-violet-50 to-cream",
  victorian: "from-rose-50 to-cream",
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
  const gradient = typeColors[property.property_type || ""] || typeColors.colonial;
  const primaryConcept = property.renovation_concepts[0] || null;

  return (
    <main className="pt-24">
      {/* Breadcrumb */}
      <section className="border-b border-stone/10 py-4">
        <Container>
          <div className="flex items-center gap-2 text-sm text-stone-lighter">
            <Link href="/properties" className="transition-colors hover:text-navy">
              Properties
            </Link>
            <span>/</span>
            <span className="text-stone">{property.address}</span>
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

              <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-5xl text-navy">
                {property.address}
              </h1>
              <p className="mt-2 text-lg text-stone-light">
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
                    <span className="text-3xl font-bold text-navy">{property.bedrooms}</span>
                    <span className="ml-1.5 text-sm text-stone-light">beds</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div>
                    <span className="text-3xl font-bold text-navy">{property.bathrooms}</span>
                    <span className="ml-1.5 text-sm text-stone-light">baths</span>
                  </div>
                )}
                {property.sqft && (
                  <div>
                    <span className="text-3xl font-bold text-navy">{property.sqft.toLocaleString()}</span>
                    <span className="ml-1.5 text-sm text-stone-light">sqft</span>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <span className="text-3xl font-bold text-navy">{property.year_built}</span>
                    <span className="ml-1.5 text-sm text-stone-light">built</span>
                  </div>
                )}
                {property.lot_sqft && (
                  <div>
                    <span className="text-3xl font-bold text-navy">{(property.lot_sqft / 1000).toFixed(1)}K</span>
                    <span className="ml-1.5 text-sm text-stone-light">lot sqft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo grid placeholder */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-xl overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`bg-cream-dark border border-stone/10 flex items-center justify-center ${i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"}`}
                >
                  <div className="text-center text-stone-lighter/40">
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="mx-auto">
                      <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              ))}
              <p className="col-span-2 mt-1 text-center text-xs text-stone-lighter">Photos coming soon</p>
            </div>
          </div>
        </Container>
      </section>

      {/* What You See Today vs What It Could Become — Side by Side */}
      <section className="py-16">
        <Container>
          <div className="grid gap-0 overflow-hidden rounded-2xl border border-stone/10 shadow-sm md:grid-cols-2">
            {/* Today */}
            <div className="bg-cream-dark p-10 md:p-12">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-stone-lighter">
                What You See Today
              </p>
              <h2 className="text-2xl font-bold text-navy">The Current Home</h2>
              {property.description && (
                <p className="mt-4 leading-relaxed text-stone-light">
                  {property.description}
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
              </div>
            </div>

            {/* After */}
            <div className="border-t border-stone/10 bg-gradient-to-br from-copper/5 to-cream p-10 md:border-l md:border-t-0 md:p-12">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
                After Projecture
              </p>
              <h2 className="text-2xl font-bold text-navy">The Transformation</h2>

              {primaryConcept ? (
                <>
                  <p className="mt-4 leading-relaxed text-stone-light">
                    {primaryConcept.description}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <DetailCard
                      label="Renovation Cost"
                      value={`${formatPrice(primaryConcept.estimated_cost_low)} – ${formatPrice(primaryConcept.estimated_cost_high)}`}
                      highlight
                    />
                    <DetailCard
                      label="Timeline"
                      value={primaryConcept.estimated_timeline_weeks ? `${primaryConcept.estimated_timeline_weeks} weeks` : "TBD"}
                      highlight
                    />
                    <DetailCard
                      label="Projected Value"
                      value={formatPrice(primaryConcept.estimated_arv)}
                      highlight
                    />
                    <DetailCard
                      label="ROI"
                      value={primaryConcept.roi_percentage ? `${primaryConcept.roi_percentage}%` : "TBD"}
                      highlight
                    />
                  </div>
                </>
              ) : (
                <p className="mt-4 text-stone-light">
                  Renovation concepts are being developed for this property. Check back soon.
                </p>
              )}
            </div>
          </div>

          {/* Additional detail cards below side-by-side */}
          {(property.estimated_market_value || property.sqft) && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.estimated_market_value && (
                <DetailCard label="Estimated Market Value" value={formatPrice(property.estimated_market_value)} />
              )}
              {property.sqft && (
                <DetailCard
                  label="Price / sqft"
                  value={`$${Math.round((property.estimated_market_value || property.listing_price || 0) / property.sqft).toLocaleString()}`}
                />
              )}
              {primaryConcept && (
                <DetailCard
                  label="Potential Value Created"
                  value={`${formatPrice((primaryConcept.estimated_arv || 0) - (property.estimated_market_value || 0) - (primaryConcept.estimated_cost_high || 0))}`}
                  highlight
                />
              )}
            </div>
          )}
        </Container>
      </section>

      {/* What It Could Become — Detailed Concepts */}
      <section className="bg-cream-dark py-16">
        <Container>
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">The Potential</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-navy">
              Renovation Concepts
            </h2>
            <p className="mt-3 max-w-2xl text-stone-light">
              Detailed cost breakdowns developed by our team with data from 18 years of local project history.
            </p>
          </div>

          {property.renovation_concepts.length > 0 ? (
            <div className="space-y-10">
              {property.renovation_concepts.map((concept) => (
                <RenovationConcept key={concept.id} concept={concept} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-stone/10 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-navy">
                Renovation concepts are being developed for this property
              </p>
              <p className="mt-2 text-sm text-stone-light">
                Our team is preparing detailed cost breakdowns and transformation plans. Check back soon.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Financial Summary */}
      {primaryConcept && (
        <section className="py-16">
          <Container size="md">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">The Numbers</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Financial Summary</h2>
            </div>

            <div className="mt-10 rounded-2xl border border-copper/20 bg-gradient-to-b from-copper/5 to-white p-8 md:p-10 shadow-sm">
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

              <p className="mt-8 text-center text-xs text-stone-lighter">
                All estimates based on 18 years of local project data. Actual costs determined after consultation.
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Financing Calculator */}
      {primaryConcept && (
        <section className="bg-cream-dark py-16">
          <Container size="md">
            <div className="text-center">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">Financing</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Estimate Your Payment</h2>
              <p className="mt-3 text-stone-light">
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
      <section className="py-16">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy">Interested in This Property?</h2>
            <p className="mt-3 text-stone-light">
              Tell us about yourself and we&apos;ll reach out with more details about this property and its renovation potential.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-stone/10 bg-white p-8 shadow-sm">
            <LeadCaptureForm source="property_detail" propertyId={property.id} />
          </div>
        </Container>
      </section>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <section className="bg-cream-dark py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-navy">Similar Properties</h2>
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
  highlight = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-stone/10 bg-white p-4">
      <p className="text-xs text-stone-lighter">{label}</p>
      <p className={`mt-1 font-semibold ${capitalize ? "capitalize" : ""} ${highlight ? "text-copper" : "text-navy"}`}>{value}</p>
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
    <div className="flex items-center justify-between border-b border-stone/10 py-3 last:border-0">
      <span className="text-sm text-stone-light">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? "text-copper" : "text-navy"}`}
      >
        {value}
      </span>
    </div>
  );
}
