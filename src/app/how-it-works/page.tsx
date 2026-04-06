import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "How It Works — Projecture",
  description: "Learn how Projecture delivers fully renovated homes — from browsing to move-in.",
};

const steps = [
  {
    num: "01",
    title: "We Identify Homes with Untapped Potential",
    description:
      "Our team scours Newton's best neighborhoods for properties with the right bones, the right lot, and the right location. We look for homes that most buyers overlook — because they can't see past the dated kitchen or the single bathroom. We see the finished product before the first wall comes down.",
    buyer: "Browse our curated listings of fully renovated homes. See the finished product — the price, the specs, the timeline — before construction even begins.",
    timeline: "New homes added regularly",
  },
  {
    num: "02",
    title: "Our Team Designs and Plans the Transformation",
    description:
      "Bay State Remodeling's design team creates a complete renovation plan — open-concept kitchens, spa-inspired bathrooms, finished basements, and every detail in between. We handle all design work, permitting, and planning so you don't have to.",
    buyer: "Reserve your future home with a commitment. Work with our team to review finishes, timelines, and any customization options available for your property.",
    timeline: "Design and permitting: 4-8 weeks",
  },
  {
    num: "03",
    title: "Bay State Remodeling Builds It to the Highest Standard",
    description:
      "With 18+ years of experience and 170+ five-star reviews, Bay State Remodeling executes every renovation to the highest standard. From structural work to finish carpentry, every detail is handled by our team. You get a fully renovated, move-in ready home — with a builder warranty.",
    buyer: "We handle everything — design, permits, construction. You get the keys to your fully renovated home, on time and under warranty.",
    timeline: "Typical construction: 4-6 months",
  },
];

const faqs = [
  {
    q: "What areas does Projecture serve?",
    a: "We're launching in Newton, MA and expanding to Brookline, Wellesley, Lexington, Cambridge, and Weston.",
  },
  {
    q: "What's included in the purchase price?",
    a: "The finished price includes everything — the property, the complete renovation, permits, design, and a 1-year builder warranty. What you see is what you pay. There are no hidden costs or renovation budgets to manage.",
  },
  {
    q: "Can I customize finishes?",
    a: "For homes in the early construction phase, we offer finish selection options — countertop materials, cabinet styles, tile selections, paint colors, and hardware. The earlier you reserve, the more flexibility you have.",
  },
  {
    q: "How do I reserve a home?",
    a: "Express interest through our website or contact our team directly. We'll schedule a consultation to discuss the property, timeline, and next steps. Homes are offered on a first-come basis.",
  },
  {
    q: "Who is behind Projecture?",
    a: "Projecture is a joint venture between Steinmetz Real Estate (26+ years, $590M+ in sales) and Bay State Remodeling (18+ years, 170+ five-star reviews). We combine deep real estate expertise with proven renovation execution.",
  },
  {
    q: "What types of renovations do you do?",
    a: "Full whole-home renovations — kitchens, bathrooms, basements, systems, exteriors, and additions. Every home receives a comprehensive transformation designed to meet modern buyer expectations.",
  },
  {
    q: "How is this different from buying a fixer-upper?",
    a: "With Projecture, you're buying the finished product — not a project. We take the risk, manage the renovation, and deliver a move-in ready home. You never have to coordinate contractors, manage a budget, or live through construction.",
  },
  {
    q: "What if I want to buy a home that isn't listed yet?",
    a: "Join our notification list to be the first to see new homes as they become available. We add new properties regularly as we identify opportunities in the market.",
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
              Browse. Reserve. Move In.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              We take the risk and do the work. You get a fully renovated, move-in ready home.
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
              Ready to See Your Future Home?
            </h2>
            <p className="mt-4 text-stone-light">
              Browse fully renovated homes in Newton&apos;s best neighborhoods.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="rounded-md bg-navy px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-light"
              >
                Browse Properties
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
