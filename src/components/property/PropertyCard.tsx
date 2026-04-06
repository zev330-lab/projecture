import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { Property } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "Price TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const typeGradients: Record<string, string> = {
  colonial: "from-amber-50 via-orange-50 to-stone-50",
  cape: "from-sage-50 via-emerald-50 to-stone-50",
  ranch: "from-sky-50 via-slate-50 to-stone-50",
  "split-level": "from-violet-50 via-purple-50 to-stone-50",
  victorian: "from-rose-50 via-pink-50 to-stone-50",
  contemporary: "from-cyan-50 via-teal-50 to-stone-50",
};

const statusLabels: Record<string, { label: string; variant: "copper" | "success" | "warning" | "default" }> = {
  published: { label: "Available", variant: "success" },
  under_contract: { label: "Under Contract", variant: "warning" },
  sold: { label: "Sold", variant: "default" },
  approved: { label: "Coming Soon", variant: "copper" },
};

function getTimelineLabel(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Ready ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PropertyCard({ property }: { property: Property }) {
  const gradient = typeGradients[property.property_type || ""] || typeGradients.colonial;
  const status = statusLabels[property.property_status] || statusLabels.published;
  const timeline = getTimelineLabel(property.estimated_ready_date);

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-stone/10 bg-white shadow-sm transition-all hover:border-copper/30 hover:shadow-md">
        {/* Image placeholder */}
        <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-lighter/40">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path d="M6 38l12-16 8 10 6-8 10 14H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="mt-2 text-xs font-medium text-stone-lighter/50">Rendering Coming Soon</span>
          </div>

          {/* Status badge */}
          <div className="absolute left-3 top-3">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          {/* Timeline badge */}
          {timeline && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy shadow-sm backdrop-blur-sm">
                {timeline}
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
            {formatPrice(property.finished_price)}
          </p>

          <div className="mt-3 flex items-center gap-3 text-sm text-stone-light">
            {property.finished_beds && <span>{property.finished_beds} bed</span>}
            {property.finished_beds && property.finished_baths && (
              <span className="text-stone/20">|</span>
            )}
            {property.finished_baths && <span>{property.finished_baths} bath</span>}
            {property.finished_baths && property.finished_sqft && (
              <span className="text-stone/20">|</span>
            )}
            {property.finished_sqft && <span>{property.finished_sqft.toLocaleString()} sqft</span>}
          </div>

          {property.teaser_description && (
            <p className="mt-3 text-sm leading-relaxed text-stone-light line-clamp-2">
              {property.teaser_description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-copper opacity-0 transition-opacity group-hover:opacity-100">
            View Home
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
