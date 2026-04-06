import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "About — Projecture",
  description: "Meet the team behind Projecture — a joint venture between Steinmetz Real Estate and Bay State Remodeling.",
};

const team = [
  {
    name: "Zev Steinmetz",
    role: "Technology & Real Estate",
    firm: "Steinmetz Real Estate — William Raveis",
    bio: "Zev brings a unique combination of technology expertise and deep real estate market knowledge. With a background in AI systems and real estate, he bridges the gap between data-driven insights and the human side of buying a home. He leads Projecture's technology platform and market strategy.",
  },
  {
    name: "Sarina Steinmetz",
    role: "Market Strategy & Client Relations",
    firm: "Steinmetz Real Estate — William Raveis",
    bio: "With 26+ years in the Newton market and $590M+ in career sales, Sarina is one of the most accomplished agents in the area. Named Top 1.5% of agents nationally, she brings unmatched knowledge of every neighborhood, street, and opportunity in the market. Her relationships and reputation are the foundation of Projecture's real estate expertise.",
  },
  {
    name: "Zion Steinmetz",
    role: "Renovation & Construction",
    firm: "Bay State Remodeling",
    bio: "As the leader of Bay State Remodeling, Zion brings 18+ years of hands-on renovation experience to every project. With 170+ five-star Google reviews and a portfolio spanning hundreds of completed projects, he provides the real-world cost data and construction expertise that makes Projecture's estimates uniquely accurate.",
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
      "One of the top-producing teams in the William Raveis network. Specialists in Newton, Brookline, Wellesley, and the Greater Boston luxury market. Known for deep neighborhood knowledge and a consultative, data-driven approach to real estate.",
  },
  {
    firm: "Bay State Remodeling",
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
      <section className="py-16 md:py-24">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              About Projecture
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Changing How People
              <br />
              Buy Homes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-light">
              Projecture was born from a simple observation: the best home for a buyer often isn&apos;t the one that looks perfect today — it&apos;s the one with the right bones, the right lot, and the right potential. We help buyers see that potential.
            </p>
          </div>
        </Container>
      </section>

      {/* Why */}
      <section className="border-t border-white/5 bg-navy-light/30 py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">The Problem We Solve</h2>
              <p className="mt-6 leading-relaxed text-slate-light">
                In markets like Newton, 80% of homes were built before 1970. Most buyers want move-in ready, but move-in ready inventory is scarce and expensive. Meanwhile, properties with enormous potential sit overlooked because buyers can&apos;t envision the transformation.
              </p>
              <p className="mt-4 leading-relaxed text-slate-light">
                The renovation gap is real: buyers don&apos;t know what&apos;s possible, what it costs, or who they can trust to do the work. Projecture closes that gap with data, visualization, and an integrated team.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Our Vision</h2>
              <p className="mt-6 leading-relaxed text-slate-light">
                We believe every property has a story about what it could become. Projecture tells that story with AI-generated visualizations, accurate cost data from 18 years of local project history, and a team that can execute the vision from search to move-in.
              </p>
              <p className="mt-4 leading-relaxed text-slate-light">
                We&apos;re starting in Newton, MA — but the model works in any market where housing stock needs updating and buyers need help seeing possibility.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-20">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              The Team
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built by People Who Know the Market
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {team.map((person) => (
              <div key={person.name} className="rounded-xl border border-white/5 bg-navy-light/40 p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-copper/10 text-copper">
                  <span className="text-xl font-bold">{person.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <h3 className="text-lg font-bold">{person.name}</h3>
                <p className="text-sm font-medium text-copper">{person.role}</p>
                <p className="mt-1 text-xs text-slate">{person.firm}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-light">{person.bio}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Credentials */}
      <section className="border-t border-white/5 bg-navy-light/30 py-20">
        <Container>
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] uppercase text-copper">
              A Joint Venture
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Two Industry Leaders. One Seamless Experience.
            </h2>
          </div>

          <div className="mt-14 space-y-8">
            {credentials.map((cred) => (
              <div key={cred.firm} className="rounded-2xl border border-white/5 bg-navy/60 p-8 md:p-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-bold">{cred.firm}</h3>
                    <p className="mt-1 text-sm text-copper">{cred.subtitle}</p>
                    <p className="mt-4 leading-relaxed text-slate-light">{cred.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {cred.stats.map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-white/5 bg-navy-light/60 p-4 text-center">
                        <p className="text-xl font-bold text-copper">{stat.value}</p>
                        <p className="mt-1 text-xs text-slate">{stat.label}</p>
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
      <section className="py-20">
        <Container size="sm">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Let&apos;s Build Something Together
            </h2>
            <p className="mt-4 text-slate-light">
              Whether you&apos;re buying, selling, or just curious about what&apos;s possible — we&apos;d love to hear from you.
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-block rounded-full bg-copper px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-copper-dark"
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
