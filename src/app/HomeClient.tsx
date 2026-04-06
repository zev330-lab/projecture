"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Container from "@/components/layout/Container";
import PropertyCard from "@/components/property/PropertyCard";
import LeadCaptureForm from "@/components/lead/LeadCaptureForm";
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

export default function HomeClient({
  featuredProperties,
}: {
  featuredProperties: Property[];
}) {
  return (
    <main>
      {/* ── Hero — compact, properties-first ── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-cream-dark to-cream">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Launching in Newton, MA
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl text-navy">
              See Beyond
              <br />
              the Listing
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              Projecture shows you what a home could become — with real costs,
              real timelines, and the team to make it happen.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="rounded-md bg-navy px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-light"
              >
                Explore Properties
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-md border border-stone/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone transition-all hover:bg-stone/5"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Featured Properties — immediately visible ── */}
      <section id="properties" className="py-16 md:py-20">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              Featured
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Properties with Potential
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-stone-light">
              Newton homes with renovation concepts, real cost data, and
              projected returns.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/properties"
              className="rounded-md border border-stone/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone transition-all hover:bg-stone/5"
            >
              View All Properties
            </Link>
          </div>
        </Container>
      </section>

      {/* ── The Problem ── */}
      <Section id="problem" className="bg-cream-dark">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              94% of buyers want move-in ready.
              <br />
              <span className="text-copper">
                80% of Newton&apos;s homes were built before 1970.
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-stone-light">
              Buyers pass over homes they can&apos;t envision renovating.
              Sellers leave value on the table. Meanwhile, the right renovation
              could turn an overlooked property into exactly the home someone is
              searching for.
            </p>

            <div className="stagger-children is-visible mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-3">
              <StatCard label="Median Home Age" value="70+ yrs" />
              <StatCard label="Median Price" value="$1.6M" />
              <StatCard label="Inventory" value="Critically Low" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Before / After — Side by Side ── */}
      <Section id="transformation">
        <Container>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
            The Transformation
          </h2>

          <div className="grid gap-0 overflow-hidden rounded-2xl border border-stone/10 shadow-sm md:grid-cols-2">
            <div className="bg-cream-dark p-10 md:p-14">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-stone-lighter">
                What You See on the Listing
              </p>
              <h3 className="mb-6 text-2xl font-bold text-navy">1955 Colonial</h3>
              <ul className="space-y-3 text-stone-light leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-stone-lighter" />
                  Dark, closed-off kitchen with original cabinetry
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-stone-lighter" />
                  Single small bathroom on the second floor
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-stone-lighter" />
                  Unfinished basement, outdated systems
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-stone-lighter" />
                  Good bones, great lot — hard to see past the surface
                </li>
              </ul>
            </div>

            <div className="border-t border-stone/10 bg-gradient-to-br from-copper/5 to-cream-dark p-10 md:border-l md:border-t-0 md:p-14">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
                What Projecture Shows You
              </p>
              <h3 className="mb-6 text-2xl font-bold text-navy">The Reimagined Home</h3>
              <ul className="space-y-3 text-stone leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  Open-concept kitchen with custom island and premium finishes
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  Primary suite with spa bathroom and walk-in closet
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  Finished lower level, all-new mechanicals
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper" />
                  A home that matches the neighborhood&apos;s best — and your
                  vision
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-6 rounded-xl border border-stone/10 bg-white px-8 py-6 text-center text-sm shadow-sm md:gap-12 md:text-base">
            <div>
              <span className="font-semibold text-copper">
                Estimated Renovation
              </span>
              <span className="ml-2 text-stone-light">
                $225,000 – $275,000
              </span>
            </div>
            <div className="hidden h-5 w-px bg-stone/10 md:block" />
            <div>
              <span className="font-semibold text-copper">Timeline</span>
              <span className="ml-2 text-stone-light">5 – 6 months</span>
            </div>
            <div className="hidden h-5 w-px bg-stone/10 md:block" />
            <div>
              <span className="font-semibold text-copper">
                Projected Value
              </span>
              <span className="ml-2 text-stone-light">$2.1M</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── How It Works ── */}
      <Section id="how-it-works" className="bg-cream-dark">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <div className="stagger-children is-visible mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <StepCard
              num="01"
              title="Browse"
              desc="Search properties by what they could become, not just what they are today."
            />
            <StepCard
              num="02"
              title="Visualize"
              desc="AI-powered renderings show the finished product — your future kitchen, bathroom, living space."
            />
            <StepCard
              num="03"
              title="Know the Numbers"
              desc="Real renovation costs from 18 years of local project data. Not estimates — intelligence."
            />
            <StepCard
              num="04"
              title="Build It"
              desc="One team handles everything. Design, permits, construction, done."
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

      {/* ── Why This Works ── */}
      <Section>
        <Container>
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Why This Works
          </h2>
          <div className="stagger-children is-visible grid gap-8 md:grid-cols-3">
            <ValueCard
              title="Real Data"
              body="Our cost estimates come from 18 years and hundreds of completed renovations in Newton, Brookline, Wellesley, and beyond. Not algorithms — experience."
            />
            <ValueCard
              title="One Team"
              body="Steinmetz Real Estate finds the property. Bay State Remodeling builds the vision. You get one seamless experience from search to move-in."
            />
            <ValueCard
              title="You're In Control"
              body="See the numbers before you commit. Customize the scope. Choose your finishes. We build exactly what you want."
            />
          </div>
        </Container>
      </Section>

      {/* ── Partners ── */}
      <Section className="bg-cream-dark">
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
                  who understand every neighborhood, every street, every
                  opportunity.
                </p>
              </div>
              <div className="rounded-xl border border-stone/10 bg-white p-10 text-left shadow-sm">
                <h3 className="text-xl font-bold text-navy">Bay State Remodeling</h3>
                <p className="mt-1 text-sm text-copper">
                  Licensed Design-Build Contractor
                </p>
                <p className="mt-4 leading-relaxed text-stone-light">
                  18+ years, 170+ Google reviews. Full-service renovation from
                  design through construction — kitchens, baths, additions, and
                  whole-home transformations.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Lead Capture ── */}
      <Section id="early-access">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Be First to See the Future
            </h2>
            <p className="mt-4 text-stone-light">
              Launching Spring 2026 in Newton, MA.
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

/* ── Sub-components ── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone/10 bg-white p-8 text-center shadow-sm">
      <p className="text-3xl font-bold text-copper">{value}</p>
      <p className="mt-2 text-sm text-stone-light">{label}</p>
    </div>
  );
}

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

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-stone/10 bg-white p-10 shadow-sm">
      <h3 className="text-xl font-bold text-navy">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-stone-light">{body}</p>
    </div>
  );
}
