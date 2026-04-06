"use client";

import { useEffect, useRef, useCallback } from "react";
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
      className={`opacity-0 py-24 md:py-32 ${className}`}
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
  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      if (href) {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <main className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center text-center bg-gradient-to-b from-navy via-navy to-navy-light animate-gradient">
        <div className="max-w-3xl px-6 animate-fade-in-up">
          <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
            Launching in Newton, MA
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            See Beyond
            <br />
            the Listing
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-light md:text-xl">
            Projecture shows you what a home could become — with real costs,
            real timelines, and the team to make it happen.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/properties"
              className="rounded-full bg-copper px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-copper-dark"
            >
              Explore Properties
            </Link>
            <a
              href="#how-it-works"
              onClick={scrollToSection}
              className="rounded-full border border-copper/40 bg-copper/10 px-8 py-3.5 text-sm font-semibold tracking-wide text-copper transition-all hover:bg-copper hover:text-white"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 text-slate/60">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-slate/40 to-transparent" />
        </div>
      </section>

      {/* ── The Problem ── */}
      <Section id="problem">
        <Container size="md">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              94% of buyers want move-in ready.
              <br />
              <span className="text-copper">
                80% of Newton&apos;s homes were built before 1970.
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-light">
              Buyers pass over homes they can&apos;t envision renovating.
              Sellers leave value on the table. Meanwhile, the right renovation
              could turn an overlooked property into exactly the home someone is
              searching for.
            </p>

            <div className="stagger-children is-visible mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-3">
              <StatCard label="Median Home Age" value="70+ yrs" />
              <StatCard label="Median Price" value="$1.6M" />
              <StatCard label="Inventory" value="Critically Low" />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── How It Works ── */}
      <Section id="how-it-works" className="bg-navy-light/50">
        <Container>
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-5xl">
            How It Works
          </h2>
          <div className="stagger-children is-visible mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
              className="text-sm font-semibold text-copper transition-colors hover:text-copper-light"
            >
              Learn more about our process &rarr;
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── Before / After ── */}
      <Section id="transformation">
        <Container>
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-5xl">
            The Transformation
          </h2>

          <div className="grid gap-0 overflow-hidden rounded-2xl border border-white/5 md:grid-cols-2">
            <div className="bg-navy-light/60 p-10 md:p-14">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-slate">
                What You See on the Listing
              </p>
              <h3 className="mb-6 text-2xl font-bold">1955 Colonial</h3>
              <ul className="space-y-3 text-slate-light leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate/50" />
                  Dark, closed-off kitchen with original cabinetry
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate/50" />
                  Single small bathroom on the second floor
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate/50" />
                  Unfinished basement, outdated systems
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-slate/50" />
                  Good bones, great lot — hard to see past the surface
                </li>
              </ul>
            </div>

            <div className="border-t border-white/5 bg-gradient-to-br from-copper/10 to-navy-light/40 p-10 md:border-l md:border-t-0 md:p-14">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
                What Projecture Shows You
              </p>
              <h3 className="mb-6 text-2xl font-bold">The Reimagined Home</h3>
              <ul className="space-y-3 text-warm-white/80 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
                  Open-concept kitchen with custom island and premium finishes
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
                  Primary suite with spa bathroom and walk-in closet
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
                  Finished lower level, all-new mechanicals
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-copper/70" />
                  A home that matches the neighborhood&apos;s best — and your
                  vision
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-6 rounded-xl border border-white/5 bg-navy-light/40 px-8 py-6 text-center text-sm md:gap-12 md:text-base">
            <div>
              <span className="font-semibold text-copper">
                Estimated Renovation
              </span>
              <span className="ml-2 text-warm-white/70">
                $225,000 – $275,000
              </span>
            </div>
            <div className="hidden h-5 w-px bg-white/10 md:block" />
            <div>
              <span className="font-semibold text-copper">Timeline</span>
              <span className="ml-2 text-warm-white/70">5 – 6 months</span>
            </div>
            <div className="hidden h-5 w-px bg-white/10 md:block" />
            <div>
              <span className="font-semibold text-copper">
                Projected Value
              </span>
              <span className="ml-2 text-warm-white/70">$2.1M</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Why This Works ── */}
      <Section className="bg-navy-light/50">
        <Container>
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-5xl">
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

      {/* ── Featured Properties ── */}
      <Section id="properties">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              Featured
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Properties with Potential
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-light">
              Newton homes with renovation concepts, real cost data, and
              projected returns.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/properties"
              className="rounded-full border border-copper/40 bg-copper/10 px-8 py-3.5 text-sm font-semibold tracking-wide text-copper transition-all hover:bg-copper hover:text-white"
            >
              View All {featuredProperties.length > 3 ? `${featuredProperties.length}+` : ""} Properties
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── Partners ── */}
      <Section className="bg-navy-light/50">
        <Container size="md">
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              A Joint Venture
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Steinmetz Real Estate &times; Bay State Remodeling
            </h2>

            <div className="mt-14 grid gap-10 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-navy/60 p-10 text-left">
                <h3 className="text-xl font-bold">Steinmetz Real Estate</h3>
                <p className="mt-1 text-sm text-copper">William Raveis</p>
                <p className="mt-4 leading-relaxed text-slate-light">
                  26+ years, $590M+ in career sales. Newton market specialists
                  who understand every neighborhood, every street, every
                  opportunity.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-navy/60 p-10 text-left">
                <h3 className="text-xl font-bold">Bay State Remodeling</h3>
                <p className="mt-1 text-sm text-copper">
                  Licensed Design-Build Contractor
                </p>
                <p className="mt-4 leading-relaxed text-slate-light">
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
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Be First to See the Future
            </h2>
            <p className="mt-4 text-slate-light">
              Launching Spring 2026 in Newton, MA.
            </p>
          </div>

          <div className="mt-12">
            <LeadCaptureForm source="homepage" />
          </div>

          <p className="mt-8 text-center text-sm text-slate">
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
    <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
      <p className="text-3xl font-bold text-copper">{value}</p>
      <p className="mt-2 text-sm text-slate-light">{label}</p>
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
    <div className="rounded-xl border border-white/5 bg-navy/60 p-8">
      <span className="text-xs font-bold tracking-widest text-copper/60">
        {num}
      </span>
      <h3 className="mt-3 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-light">{desc}</p>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-navy/60 p-10">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-slate-light">{body}</p>
    </div>
  );
}
