import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { getProperties } from "@/lib/data/get-data";
import PropertiesClient from "./PropertiesClient";

export const metadata: Metadata = {
  title: "Properties — Projecture",
  description:
    "Browse properties with renovation potential in Newton, MA and surrounding towns.",
};

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-12 md:py-16 bg-cream-dark">
        <Container>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Marketplace
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-navy">
              Properties with Potential
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              Every property includes renovation concepts with real costs,
              timelines, and projected values.
            </p>
          </div>
        </Container>
      </section>

      <PropertiesClient properties={properties} />
    </main>
  );
}
