"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import PropertyCard from "@/components/property/PropertyCard";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
import { Select } from "@/components/ui/Input";
import type { Property } from "@/lib/types";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          el.classList.add("animate-fade-in-up");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`opacity-0 py-20 md:py-24 ${className}`}
    >
      {children}
    </section>
  );
}

const villages = [
  "Newton Center",
  "West Newton",
  "Waban",
  "Newton Highlands",
  "Chestnut Hill",
  "Newtonville",
];

const priceRanges = [
  { value: "", label: "Any Price" },
  { value: "0-1300000", label: "Under $1.3M" },
  { value: "1300000-1600000", label: "$1.3M - $1.6M" },
  { value: "1600000-2000000", label: "$1.6M - $2M" },
  { value: "2000000-99999999", label: "$2M+" },
];

export default function HomeClient({
  featuredProperties,
}: {
  featuredProperties: Property[];
}) {
  const [village, setVillage] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");

  const filtered = useMemo(() => {
    let result = [...featuredProperties];

    if (village) {
      result = result.filter((p) => p.neighborhood === village);
    }
    if (price) {
      const [min, max] = price.split("-").map(Number);
      result = result.filter((p) => {
        const val = p.finished_price || 0;
        return val >= min && val <= max;
      });
    }
    if (beds) {
      result = result.filter((p) => (p.finished_beds || 0) >= parseInt(beds));
    }

    return result;
  }, [featuredProperties, village, price, beds]);

  return (
    <main>
      {/* Hero — compact, properties visible immediately below */}
      <section className="pt-28 pb-8 md:pt-36 md:pb-12 bg-gradient-to-b from-cream-dark to-cream">
        <Container size="md">
          <div className="text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl text-navy">
              See Beyond
              <br />
              the Listing
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              Fully renovated homes in Newton — designed, built, and delivered by our team.
            </p>
          </div>

          {/* Inline filter bar */}
          <div className="mt-8 rounded-xl border border-stone/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Select value={village} onChange={(e) => setVillage(e.target.value)}>
                  <option value="">All Villages</option>
                  {villages.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select value={price} onChange={(e) => setPrice(e.target.value)}>
                  {priceRanges.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select value={beds} onChange={(e) => setBeds(e.target.value)}>
                  <option value="">Bedrooms</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </Select>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Property Grid — immediately visible */}
      <section id="properties" className="pb-16 md:pb-20">
        <Container>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-xl border border-stone/10 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-semibold text-navy">No properties match your filters</p>
              <p className="mt-2 text-sm text-stone-light">Try adjusting your search criteria</p>
              <button
                onClick={() => { setVillage(""); setPrice(""); setBeds(""); }}
                className="mt-4 text-sm font-semibold text-copper hover:text-copper-dark"
              >
                Clear all filters
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                href="/properties"
                className="rounded-md border border-stone/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone transition-all hover:bg-stone/5"
              >
                View All Properties
              </Link>
            </div>
          )}
        </Container>
      </section>

      {/* How It Works — 3 steps */}
      <Section id="how-it-works" className="bg-cream-dark">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <div className="stagger-children is-visible mt-14 grid gap-8 md:grid-cols-3">
            <StepCard
              num="01"
              title="Browse"
              desc="Explore fully renovated homes before they're built. See the finished product, the price, and the timeline."
            />
            <StepCard
              num="02"
              title="Reserve"
              desc="Secure your future home with a commitment. Work with our team to finalize details and finishes."
            />
            <StepCard
              num="03"
              title="Move In"
              desc="We handle everything — design, permits, construction. You get the keys to your fully renovated home."
            />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-copper transition-colors hover:text-copper-dark"
            >
              Learn more about our process &rarr;
            </Link>
          </div>
        </Container>
      </Section>

      {/* Partners */}
      <Section>
        <Container size="md">
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              A Joint Venture
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Steinmetz Real Estate &times; Bay State Remodeling
            </h2>

            <div className="mt-14 grid gap-10 md:grid-cols-2">
              <div className="rounded-xl border border-stone/10 bg-white p-10 text-left shadow-sm">
                <h3 className="text-xl font-bold text-navy">Steinmetz Real Estate</h3>
                <p className="mt-1 text-sm text-copper">William Raveis</p>
                <p className="mt-4 leading-relaxed text-stone-light">
                  26+ years, $590M+ in career sales. Newton market specialists
                  who identify the best opportunities in every neighborhood.
                </p>
              </div>
              <div className="rounded-xl border border-stone/10 bg-white p-10 text-left shadow-sm">
                <h3 className="text-xl font-bold text-navy">Bay State Remodeling</h3>
                <p className="mt-1 text-sm text-copper">
                  Licensed Design-Build Contractor
                </p>
                <p className="mt-4 leading-relaxed text-stone-light">
                  18+ years, 170+ Google reviews. Full-service renovation from
                  design through construction — delivering homes to the highest standard.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Lead Capture */}
      <Section id="early-access" className="bg-cream-dark">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get Notified of New Listings
            </h2>
            <p className="mt-4 text-stone-light">
              Be the first to see new homes as they become available.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-stone/10 bg-white p-8 shadow-sm">
            <LeadCaptureForm source="homepage" />
          </div>

          <p className="mt-8 text-center text-sm text-stone-lighter">
            Expanding to Brookline, Wellesley, Lexington, Cambridge, and Weston.
          </p>
        </Container>
      </Section>
    </main>
  );
}

/* Sub-components */

function StepCard({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-stone/10 bg-white p-8 shadow-sm">
      <span className="text-xs font-bold tracking-widest text-copper/60">
        {num}
      </span>
      <h3 className="mt-3 text-xl font-bold text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-stone-light">{desc}</p>
    </div>
  );
}
