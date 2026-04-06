import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import Badge from "@/components/ui/Badge";
import PropertyCard from "@/components/property/PropertyCard";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import MortgageCalculator from "./MortgageCalculator";
import { getPropertyWithConcepts, getSimilarProperties } from "@/lib/data/get-data";
import { getPropertyPhotos } from "@/lib/data/photos";

function formatPrice(price: number | null): string {
  if (!price) return "TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const typeGradients: Record<string, string> = {
  colonial: "from-amber-50 to-cream",
  cape: "from-emerald-50 to-cream",
  ranch: "from-sky-50 to-cream",
  "split-level": "from-violet-50 to-cream",
  victorian: "from-rose-50 to-cream",
};

const statusLabels: Record<string, { label: string; variant: "copper" | "success" | "warning" | "default" }> = {
  published: { label: "Available", variant: "success" },
  under_contract: { label: "Under Contract", variant: "warning" },
  sold: { label: "Sold", variant: "default" },
};

function getTimelineLabel(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

const finishedImageLabels = [
  "Renovated Exterior",
  "Chef's Kitchen",
  "Spa Primary Bath",
  "Open Living Room",
  "Primary Suite",
  "Outdoor Living",
];

const currentImageLabels = [
  "Current Exterior",
  "Existing Kitchen",
  "Current Bath",
];

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
    description: property.teaser_description || `Fully renovated home at ${property.address}. ${formatPrice(property.finished_price)}.`,
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
  const status = statusLabels[property.property_status] || statusLabels.published;
  const timeline = getTimelineLabel(property.estimated_ready_date);
  const photos = getPropertyPhotos(property.address);
  const heroImage = photos?.card_image;
  const galleryImages = photos?.gallery || [];

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

      {/* Hero — finished home render placeholder */}
      <section className={`bg-gradient-to-b ${gradient} py-12`}>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Main image */}
            <div className={`relative aspect-[16/10] overflow-hidden rounded-xl border border-stone/10 ${heroImage ? "bg-stone-100" : "bg-white/60"}`}>
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={`${property.address} — renovated home`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-lighter/40">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="mt-2 text-sm font-medium">Rendering Coming Soon</span>
                </div>
              )}

              <div className="absolute left-4 top-4 z-10 flex gap-2">
                <Badge variant={status.variant} className="text-sm px-4 py-1.5">{status.label}</Badge>
              </div>

              {timeline && (
                <div className="absolute right-4 top-4 z-10">
                  <span className="inline-flex items-center rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-navy shadow-sm backdrop-blur-sm">
                    Ready {timeline}
                  </span>
                </div>
              )}
            </div>

            {/* Quick info sidebar */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase text-stone-lighter">
                  {property.neighborhood && `${property.neighborhood}, `}{property.city}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-navy">
                  {property.address}
                </h1>
              </div>

              <p className="text-4xl font-bold text-copper">
                {formatPrice(property.finished_price)}
              </p>

              {/* Finished specs */}
              <div className="flex flex-wrap gap-6">
                {property.finished_beds && (
                  <div>
                    <span className="text-2xl font-bold text-navy">{property.finished_beds}</span>
                    <span className="ml-1 text-sm text-stone-light">beds</span>
                  </div>
                )}
                {property.finished_baths && (
                  <div>
                    <span className="text-2xl font-bold text-navy">{property.finished_baths}</span>
                    <span className="ml-1 text-sm text-stone-light">baths</span>
                  </div>
                )}
                {property.finished_sqft && (
                  <div>
                    <span className="text-2xl font-bold text-navy">{property.finished_sqft.toLocaleString()}</span>
                    <span className="ml-1 text-sm text-stone-light">sqft</span>
                  </div>
                )}
                {property.lot_sqft && (
                  <div>
                    <span className="text-2xl font-bold text-navy">{(property.lot_sqft / 1000).toFixed(1)}K</span>
                    <span className="ml-1 text-sm text-stone-light">lot sqft</span>
                  </div>
                )}
              </div>

              <div className="mt-auto rounded-lg border border-stone/10 bg-white p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-stone-lighter">Property Type</p>
                    <p className="mt-0.5 font-semibold text-navy capitalize">{property.property_type || "Residential"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-lighter">Year Built</p>
                    <p className="mt-0.5 font-semibold text-navy">{property.year_built || "—"}</p>
                  </div>
                  {timeline && (
                    <div>
                      <p className="text-xs text-stone-lighter">Available</p>
                      <p className="mt-0.5 font-semibold text-copper">{timeline}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-stone-lighter">Neighborhood</p>
                    <p className="mt-0.5 font-semibold text-navy">{property.neighborhood || property.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 1: Your Future Home */}
      <section className="py-16">
        <Container>
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-copper">Your Future Home</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">
              The Finished Home
            </h2>
          </div>

          {/* Image gallery */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(galleryImages.length > 0 ? galleryImages : finishedImageLabels).map((item, i) => {
              const isImage = galleryImages.length > 0;
              const label = finishedImageLabels[i] || "Gallery";
              return (
                <div
                  key={`gallery-${i}`}
                  className={`relative overflow-hidden rounded-xl border border-stone/10 ${
                    i === 0 ? "sm:col-span-2 lg:col-span-2 aspect-[2/1]" : "aspect-[4/3]"
                  }`}
                >
                  {isImage ? (
                    <Image
                      src={item}
                      alt={`${property.address} — ${label}`}
                      fill
                      sizes={i === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-cream flex flex-col items-center justify-center text-stone-lighter/50">
                      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                        <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <span className="mt-2 text-xs font-medium">{item}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Description */}
          {property.full_description && (
            <div className="mt-10 max-w-3xl">
              <p className="text-lg leading-relaxed text-stone-light">
                {property.full_description}
              </p>
            </div>
          )}

          {/* Finished specs grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {property.finished_beds && (
              <SpecCard label="Bedrooms" value={String(property.finished_beds)} />
            )}
            {property.finished_baths && (
              <SpecCard label="Bathrooms" value={String(property.finished_baths)} />
            )}
            {property.finished_sqft && (
              <SpecCard label="Finished Sqft" value={property.finished_sqft.toLocaleString()} />
            )}
            {property.lot_sqft && (
              <SpecCard label="Lot Size" value={`${property.lot_sqft.toLocaleString()} sqft`} />
            )}
          </div>
        </Container>
      </section>

      {/* Section 2: Key Details */}
      <section className="bg-cream-dark py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-navy">Key Details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <DetailRow label="Price" value={formatPrice(property.finished_price)} highlight />
                {timeline && <DetailRow label="Available" value={timeline} highlight />}
                <DetailRow label="Neighborhood" value={property.neighborhood || property.city} />
                <DetailRow label="Property Type" value={property.property_type || "Residential"} capitalize />
                <DetailRow label="Lot Size" value={property.lot_sqft ? `${property.lot_sqft.toLocaleString()} sqft` : "—"} />
                <DetailRow label="Year Built" value={String(property.year_built || "—")} />
              </div>
            </div>

            {/* Mortgage estimate */}
            {property.finished_price && (
              <div>
                <h2 className="text-2xl font-bold text-navy">Estimate Your Payment</h2>
                <div className="mt-6">
                  <MortgageCalculator price={property.finished_price} />
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Section 3: The Property Today */}
      <section className="py-16">
        <Container>
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-lighter">The Property Today</p>
            <h2 className="mt-2 text-2xl font-bold text-navy">Current State</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* Current images */}
            <div className="grid grid-cols-3 gap-2">
              {currentImageLabels.map((label, i) => {
                const imgSrc = galleryImages[galleryImages.length - 1 - i];
                return (
                  <div
                    key={label}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stone/10"
                  >
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={`${property.address} — ${label}`}
                        fill
                        sizes="(max-width: 640px) 33vw, 20vw"
                        className="object-cover opacity-80 grayscale-[30%]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 flex flex-col items-center justify-center text-stone-lighter/40">
                        <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                          <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span className="mt-1 text-[10px] font-medium">{label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <p className="leading-relaxed text-stone-light">
                This {property.year_built} {property.property_type} is currently off-market.
                Our team will fully renovate this property to deliver the home shown above.
              </p>
              {property.description && (
                <p className="mt-4 text-sm leading-relaxed text-stone-lighter">
                  {property.description}
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-stone/10 bg-white p-3">
                  <p className="text-xs text-stone-lighter">Current Beds</p>
                  <p className="font-semibold text-navy">{property.bedrooms || "—"}</p>
                </div>
                <div className="rounded-lg border border-stone/10 bg-white p-3">
                  <p className="text-xs text-stone-lighter">Current Baths</p>
                  <p className="font-semibold text-navy">{property.bathrooms || "—"}</p>
                </div>
                <div className="rounded-lg border border-stone/10 bg-white p-3">
                  <p className="text-xs text-stone-lighter">Current Sqft</p>
                  <p className="font-semibold text-navy">{property.sqft?.toLocaleString() || "—"}</p>
                </div>
                <div className="rounded-lg border border-stone/10 bg-white p-3">
                  <p className="text-xs text-stone-lighter">Year Built</p>
                  <p className="font-semibold text-navy">{property.year_built || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 4: What's Included */}
      {property.included_features && property.included_features.length > 0 && (
        <section className="bg-cream-dark py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-navy">What&apos;s Included</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {property.included_features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-lg border border-stone/10 bg-white p-4"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0 text-copper">
                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm leading-relaxed text-stone">{feature}</span>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Section 5: The Team */}
      <section className="py-16">
        <Container>
          <h2 className="mb-8 text-center text-2xl font-bold text-navy">The Team Behind Your Home</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-stone/10 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-navy">Steinmetz Real Estate</h3>
              <p className="mt-1 text-sm text-copper">William Raveis</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-light">
                26+ years in the Newton market, $590M+ in career sales. Sarina Steinmetz is one of the top-producing
                agents in the William Raveis network, bringing unmatched local market expertise.
              </p>
            </div>
            <div className="rounded-xl border border-stone/10 bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-navy">Bay State Remodeling / Bay State Holdings Group</h3>
              <p className="mt-1 text-sm text-copper">Licensed Design-Build Contractor</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-light">
                18+ years in business, 170+ five-star Google reviews. Zion Yehoshua and team deliver full-service
                renovation from design through construction, on time and on budget.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Section 6: Interest Form */}
      <section className="bg-cream-dark py-16">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy">Interested in This Home?</h2>
            <p className="mt-3 text-stone-light">
              Secure your interest early — these homes are offered on a first-come basis.
            </p>
          </div>
          <div className="mt-8 rounded-2xl border border-stone/10 bg-white p-8 shadow-sm">
            <LeadCaptureForm source="property_detail" propertyId={property.id} />
          </div>
        </Container>
      </section>

      {/* Section 7: Similar Properties */}
      {similar.length > 0 && (
        <section className="py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-navy">More Properties</h2>
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

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone/10 bg-white p-4">
      <p className="text-xs text-stone-lighter">{label}</p>
      <p className="mt-1 text-lg font-bold text-navy">{value}</p>
    </div>
  );
}

function DetailRow({
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
      <p className={`mt-1 font-semibold ${capitalize ? "capitalize" : ""} ${highlight ? "text-copper" : "text-navy"}`}>
        {value}
      </p>
    </div>
  );
}
