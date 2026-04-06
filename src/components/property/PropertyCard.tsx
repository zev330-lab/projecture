import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Property } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "Price TBD";
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(price % 1000000 === 0 ? 1 : 2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const typeColors: Record<string, string> = {
  colonial: "from-amber-100 to-stone-100",
  cape: "from-sky-100 to-stone-100",
  ranch: "from-emerald-100 to-stone-100",
  "split-level": "from-violet-100 to-stone-100",
  victorian: "from-rose-100 to-stone-100",
  contemporary: "from-cyan-100 to-stone-100",
};

function scoreColor(score: number): "success" | "warning" | "danger" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export default function PropertyCard({
  property,
  showCostRange,
}: {
  property: Property;
  showCostRange?: { low: number; high: number } | null;
}) {
  const gradient =
    typeColors[property.property_type || ""] || typeColors.colonial;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-stone/10 bg-white shadow-sm transition-all hover:border-copper/30 hover:shadow-md">
        {/* Gradient placeholder */}
        <div
          className={`relative aspect-[4/3] bg-gradient-to-br ${gradient}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-lighter/60">
            <svg
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
            >
              <path
                d="M6 38l12-16 8 10 6-8 10 14H6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle
                cx="34"
                cy="14"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="mt-1 text-xs capitalize">
              {property.property_type || "Home"}
            </span>
          </div>

          {/* Renovation Score badge */}
          {property.renovation_score !== null && property.renovation_score > 0 && (
            <div className="absolute right-3 top-3">
              <Badge variant={scoreColor(property.renovation_score)}>
                {property.renovation_score} Reno Score
              </Badge>
            </div>
          )}

          {/* Cost range tag */}
          {showCostRange && (
            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm shadow-sm">
              <span className="text-xs font-medium text-copper-dark">
                Reno: {formatPrice(showCostRange.low)} – {formatPrice(showCostRange.high)}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <p className="text-xs font-semibold tracking-wider uppercase text-stone-lighter">
            {property.neighborhood || property.city}
          </p>
          <h3 className="mt-1 text-lg font-bold text-navy transition-colors group-hover:text-copper">
            {property.address}
          </h3>
          <p className="mt-1 text-xl font-bold text-copper">
            {formatPrice(property.estimated_market_value || property.listing_price)}
          </p>

          <div className="mt-3 flex items-center gap-3 text-sm text-stone-light">
            {property.bedrooms && <span>{property.bedrooms} bed</span>}
            {property.bedrooms && property.bathrooms && (
              <span className="text-stone/20">|</span>
            )}
            {property.bathrooms && <span>{property.bathrooms} bath</span>}
            {property.bathrooms && property.sqft && (
              <span className="text-stone/20">|</span>
            )}
            {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
            {property.sqft && property.year_built && (
              <span className="text-stone/20">|</span>
            )}
            {property.year_built && <span>{property.year_built}</span>}
          </div>

          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-copper opacity-0 transition-opacity group-hover:opacity-100">
            See the Potential
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M3 7h8M8 4l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-stone/10 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-cream-dark" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-stone/10" />
        <div className="h-5 w-40 animate-pulse rounded bg-stone/10" />
        <div className="h-6 w-28 animate-pulse rounded bg-stone/10" />
        <div className="flex gap-4">
          <div className="h-4 w-12 animate-pulse rounded bg-stone/10" />
          <div className="h-4 w-12 animate-pulse rounded bg-stone/10" />
          <div className="h-4 w-16 animate-pulse rounded bg-stone/10" />
        </div>
      </div>
    </div>
  );
}
