import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "About — Projecture",
  description: "Meet the team behind Projecture — a joint venture between Steinmetz Real Estate and Bay State Remodeling delivering fully renovated homes.",
};

const team = [
  {
    name: "Zev Steinmetz",
    role: "Technology & Strategy",
    firm: "Steinmetz Real Estate — William Raveis",
    bio: "Zev brings a unique combination of technology expertise and deep real estate market knowledge. He leads Projecture's platform and market strategy, using data and AI to identify the best opportunities and deliver a seamless buyer experience.",
  },
  {
    name: "Sarina Steinmetz",
    role: "Market Strategy & Acquisitions",
    firm: "Steinmetz Real Estate — William Raveis",
    bio: "With 26+ years in the Newton market and $590M+ in career sales, Sarina is one of the most accomplished agents in the area. Named Top 1.5% nationally, she identifies acquisition opportunities and ensures every Projecture home is priced right for the market.",
  },
  {
    name: "Zion Yehoshua",
    role: "Renovation & Construction",
    firm: "Bay State Remodeling / Bay State Holdings Group",
    bio: "As the owner of Bay State Remodeling and Bay State Holdings Group, Zion brings 18+ years of hands-on renovation experience. With 170+ five-star Google reviews and hundreds of completed projects, he oversees every renovation from design through construction to ensure the highest quality.",
  },
];

const credentials = [
  {
    firm: "Steinmetz Real Estate",
    subtitle: "William Raveis Real Estate",
    stats: [
      { label: "Career Sales", value: "$590M+" },
      { label: "Years in Market", value: "26+" },
      { label: "National Ranking", value: "Top 1.5%" },
      { label: "Markets", value: "Newton & Beyond" },
    ],
    description:
      "One of the top-producing teams in the William Raveis network. Specialists in Newton, Brookline, Wellesley, and the Greater Boston luxury market. Known for deep neighborhood knowledge and a consultative approach to real estate.",
  },
  {
    firm: "Bay State Remodeling / Bay State Holdings Group",
    subtitle: "Licensed Design-Build Contractor",
    stats: [
      { label: "Years in Business", value: "18+" },
      { label: "Google Reviews", value: "170+" },
      { label: "Project Types", value: "Full Service" },
      { label: "Service Area", value: "Greater Boston" },
    ],
    description:
      "Full-service design-build renovation firm handling everything from kitchen and bathroom remodels to whole-home transformations, additions, and historic restorations. Known for transparent pricing, reliable timelines, and craftsmanship that speaks for itself.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-cream-dark">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              About Projecture
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-navy">
              We Take the Risk.
              <br />
              You Get the Home.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-light">
              Projecture identifies homes with untapped potential, renovates them to the highest standard, and delivers
              the finished product to buyers — turnkey, move-in ready, under warranty.
            </p>
          </div>
        </Container>
      </section>

      {/* Our Model */}
      <section className="py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy">Our Model</h2>
              <p className="mt-6 leading-relaxed text-stone-light">
                Most buyers want move-in ready. But in markets like Newton, where 80% of homes were built before 1970,
                the best opportunities often need renovation. The problem? Buyers don&apos;t want to manage a renovation.
                They don&apos;t want to hire contractors, pull permits, or live through construction.
              </p>
              <p className="mt-4 leading-relaxed text-stone-light">
                Projecture solves this. We acquire promising properties, design and execute a complete renovation through
                Bay State Remodeling, and sell the finished home at an all-in price. The buyer gets a move-in ready home
                without ever touching a paint swatch or calling a contractor.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-navy">Why It Works</h2>
              <p className="mt-6 leading-relaxed text-stone-light">
                We combine Steinmetz Real Estate&apos;s 26+ years of market expertise with Bay State Remodeling&apos;s
                18+ years of renovation experience. We know which properties to buy, exactly what they&apos;ll cost
                to renovate, and what the finished product will sell for.
              </p>
              <p className="mt-4 leading-relaxed text-stone-light">
                The result is a better deal for everyone. Buyers get a renovated home at a fair price without the risk
                or hassle of managing a renovation. And they can see exactly what they&apos;re getting before they commit.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="bg-cream-dark py-20">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              The Team
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-navy">
              Built by People Who Know the Market
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {team.map((person) => (
              <div key={person.name} className="rounded-xl border border-stone/10 bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-copper/10 text-copper">
                  <span className="text-xl font-bold">{person.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <h3 className="text-lg font-bold text-navy">{person.name}</h3>
                <p className="text-sm font-medium text-copper">{person.role}</p>
                <p className="mt-1 text-xs text-stone-lighter">{person.firm}</p>
                <p className="mt-4 text-sm leading-relaxed text-stone-light">{person.bio}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Credentials */}
      <section className="py-20">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              A Joint Venture
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-navy">
              Two Industry Leaders. One Seamless Experience.
            </h2>
          </div>

          <div className="mt-14 space-y-8">
            {credentials.map((cred) => (
              <div key={cred.firm} className="rounded-2xl border border-stone/10 bg-white p-8 md:p-10 shadow-sm">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-bold text-navy">{cred.firm}</h3>
                    <p className="mt-1 text-sm text-copper">{cred.subtitle}</p>
                    <p className="mt-4 leading-relaxed text-stone-light">{cred.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {cred.stats.map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-stone/10 bg-cream-dark p-4 text-center">
                        <p className="text-xl font-bold text-copper">{stat.value}</p>
                        <p className="mt-1 text-xs text-stone-lighter">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-cream-dark py-20">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy">
              See What&apos;s Available
            </h2>
            <p className="mt-4 text-stone-light">
              Browse our current inventory of fully renovated homes in Newton.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/properties"
                className="inline-block rounded-md bg-navy px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-navy-light"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact"
                className="inline-block rounded-md border border-stone/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-stone transition-all hover:bg-stone/5"
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
