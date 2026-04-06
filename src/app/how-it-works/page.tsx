import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "How It Works — Projecture",
  description: "Learn how Projecture helps you see the potential in every home — from browsing to building.",
};

const steps = [
  {
    num: "01",
    title: "Browse Properties by Potential",
    description:
      "Traditional listings show you what a home is today. Projecture shows you what it could become. Every property in our marketplace includes detailed renovation concepts — so you can search by the finished product, not just the current state.",
    buyer: "Browse our curated listings filtered by neighborhood, budget, and renovation scope. Each property shows its current state alongside its potential.",
    timeline: "Start anytime — browse at your own pace",
  },
  {
    num: "02",
    title: "Visualize the Transformation",
    description:
      "AI-generated renderings bring renovation concepts to life. See what a dated 1955 kitchen looks like as a modern open-concept space. Explore different finish levels and layout options before committing to anything.",
    buyer: "Review AI-rendered visualizations of each renovation concept. Compare multiple design options. Get a real sense of the finished space.",
    timeline: "Concepts ready when you browse",
  },
  {
    num: "03",
    title: "Know the Real Numbers",
    description:
      "Our cost estimates aren't pulled from national averages — they're built from 18 years and hundreds of completed renovation projects in Newton, Brookline, Wellesley, and the surrounding area. You see line-item breakdowns, realistic timelines, and projected after-renovation values.",
    buyer: "Review detailed cost breakdowns by category (kitchen, bath, structural, etc.), estimated timelines, and projected ROI. No surprises.",
    timeline: "Numbers available for every published concept",
  },
  {
    num: "04",
    title: "Build It with One Team",
    description:
      "When you're ready, our integrated team handles everything. Steinmetz Real Estate manages the acquisition. Bay State Remodeling executes the renovation. Design, permits, construction — one team, one process, one point of accountability.",
    buyer: "Work with a single team from property search through renovation completion. Design consultations, permit management, and full construction management included.",
    timeline: "Typical renovation: 4-8 months depending on scope",
  },
];

const faqs = [
  {
    q: "What areas does Projecture serve?",
    a: "We're launching in Newton, MA and expanding to Brookline, Wellesley, Lexington, Cambridge, and Weston.",
  },
  {
    q: "How accurate are the renovation cost estimates?",
    a: "Our estimates are built from 18 years and hundreds of completed renovation projects in the local market. They include labor, materials, permits, and professional fees. While actual costs can vary based on specific conditions and selections, our estimates are among the most accurate available because they're based on real local project data — not national averages.",
  },
  {
    q: "Do I have to use your renovation team?",
    a: "Our integrated model works best when the same team handles both the real estate transaction and the renovation. However, the property data and renovation concepts are valuable regardless of who executes the work.",
  },
  {
    q: "How are properties selected for the marketplace?",
    a: "We identify properties with strong renovation potential — good bones, desirable locations, and clear value-add opportunities. Each property is evaluated for its transformation potential before being listed.",
  },
  {
    q: "What types of renovations do you handle?",
    a: "Everything from kitchen and bathroom remodels to full whole-home renovations, additions, and historic restorations. Bay State Remodeling is a fully licensed design-build contractor.",
  },
  {
    q: "Can I customize the renovation scope?",
    a: "Absolutely. Our concepts are starting points. You can adjust scope, modify finishes, add or remove elements — we build exactly what you want.",
  },
  {
    q: "How does financing work?",
    a: "We can guide you through renovation-specific financing options including FHA 203(k) loans, Fannie Mae HomeStyle renovation loans, and construction-to-permanent financing. We work with lenders experienced in renovation lending.",
  },
  {
    q: "When does Projecture launch?",
    a: "Spring 2026 in Newton, MA. Join our early access list to be the first to see properties.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-cream-dark">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Our Process
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-navy">
              From Listing to Living
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              We show you what it could be. Then we build it. Here&apos;s exactly how the process works.
            </p>
          </div>
        </Container>
      </section>

      {/* Steps */}
      <section className="py-20">
        <Container>
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`grid gap-10 rounded-2xl border border-stone/10 p-8 md:grid-cols-2 md:p-12 shadow-sm ${
                  i % 2 === 0 ? "bg-white" : "bg-cream-dark"
                }`}
              >
                <div>
                  <span className="text-xs font-bold tracking-widest text-copper/60">{step.num}</span>
                  <h2 className="mt-3 text-2xl font-bold md:text-3xl text-navy">{step.title}</h2>
                  <p className="mt-4 leading-relaxed text-stone-light">{step.description}</p>
                </div>
                <div className="space-y-6">
                  <div className="rounded-xl border border-stone/10 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-copper">What You Experience</p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-light">{step.buyer}</p>
                  </div>
                  <div className="rounded-xl border border-stone/10 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-lighter">Timeline</p>
                    <p className="mt-2 text-sm text-stone">{step.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-cream-dark py-20">
        <Container size="md">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl text-navy">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl border border-stone/10 bg-white p-6 shadow-sm"
              >
                <h3 className="font-semibold text-navy">{faq.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-navy">
              Ready to See What&apos;s Possible?
            </h2>
            <p className="mt-4 text-stone-light">
              Join our early access list and be the first to browse properties with renovation potential.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="rounded-md bg-copper px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-copper-dark"
              >
                Explore Properties
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-stone/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone transition-all hover:bg-stone/5"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
