import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import { getProperties } from "@/lib/data/get-data";
import PropertiesClient from "./PropertiesClient";

export const metadata: Metadata = {
  title: "Properties — Projecture",
  description:
    "Browse fully renovated homes in Newton, MA. See the finished product, the price, and the timeline.",
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
              Our Homes
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-navy">
              Fully Renovated Homes
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              Move-in ready homes in Newton&apos;s best neighborhoods. Designed, built, and delivered by our team.
            </p>
          </div>
        </Container>
      </section>

      <PropertiesClient properties={properties} />
    </main>
  );
}
