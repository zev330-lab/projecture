import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/layout/Container";
import PropertyFilters from "@/components/property/PropertyFilters";
import PropertyGrid from "@/components/property/PropertyGrid";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import { PropertyCardSkeleton } from "@/components/property/PropertyCard";
import type { Property } from "@/lib/types";

export const metadata: Metadata = {
  title: "Properties — Projecture",
  description: "Browse properties with renovation potential in Newton, MA and surrounding towns.",
};

async function getProperties(): Promise<Property[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as Property[]) || [];
  } catch {
    return [];
  }
}

export default async function PropertiesPage() {
  const properties = await getProperties();
  const hasProperties = properties.length > 0;

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Marketplace
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Properties with Potential
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-light">
              Every property includes renovation concepts with real costs, timelines, and projected values.
            </p>
          </div>
        </Container>
      </section>

      {hasProperties ? (
        <section className="pb-24">
          <Container size="xl">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <aside className="hidden lg:block">
                <Suspense>
                  <PropertyFilters />
                </Suspense>
              </aside>
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-slate-light">
                    {properties.length} {properties.length === 1 ? "property" : "properties"}
                  </p>
                </div>
                <PropertyGrid properties={properties} />
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <section className="pb-24">
          <Container size="md">
            {/* Coming Soon State */}
            <div className="mb-16 grid gap-6 md:grid-cols-3">
              <ComingSoonCard neighborhood="Newtonville" type="1955 Colonial" />
              <ComingSoonCard neighborhood="West Newton Hill" type="1962 Split-Level" />
              <ComingSoonCard neighborhood="Waban" type="1948 Cape" />
            </div>

            <div className="mx-auto max-w-lg rounded-2xl border border-white/5 bg-navy-light/40 p-8 text-center">
              <h2 className="text-2xl font-bold">Coming Spring 2026</h2>
              <p className="mt-3 text-slate-light">
                Our first renovation concepts are being developed for properties in Newton, MA.
                Join the early access list to be notified when they go live.
              </p>
              <div className="mt-8">
                <LeadCaptureForm source="properties_page" compact />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Skeleton preview showing what it will look like */}
      {!hasProperties && (
        <section className="border-t border-white/5 bg-navy-light/20 py-24">
          <Container>
            <h2 className="mb-8 text-center text-xl font-bold text-slate">
              Preview: What the marketplace will look like
            </h2>
            <div className="grid gap-6 opacity-40 sm:grid-cols-2 lg:grid-cols-3">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}

function ComingSoonCard({ neighborhood, type }: { neighborhood: string; type: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-navy-light/40 p-10">
      <span className="absolute right-4 top-4 rounded-full bg-copper/15 px-3 py-1 text-xs font-semibold text-copper">
        Coming Soon
      </span>
      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate">
        {neighborhood}
      </p>
      <h3 className="mt-2 text-xl font-bold">{type}</h3>
      <p className="mt-3 text-sm text-slate-light">Renovation concept in development</p>
    </div>
  );
}
