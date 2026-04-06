import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import ContactForm from "@/components/lead/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Projecture",
  description: "Get in touch with the Projecture team. Interested in a fully renovated home in Newton? We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 md:py-24 bg-cream-dark">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Contact Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-navy">
              Let&apos;s Talk
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-light">
              Interested in a fully renovated home? Have questions about our process? We&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Steinmetz RE */}
                <div className="rounded-xl border border-stone/10 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-navy">Steinmetz Real Estate</h3>
                  <p className="mt-1 text-sm text-copper">William Raveis</p>
                  <div className="mt-4 space-y-2 text-sm text-stone-light">
                    <p>Sarina &amp; Zev Steinmetz</p>
                    <a href="tel:6172441366" className="block transition-colors hover:text-navy">
                      (617) 244-1366
                    </a>
                    <a href="mailto:sarina@steinmetzrealestate.com" className="block transition-colors hover:text-navy">
                      sarina@steinmetzrealestate.com
                    </a>
                    <p className="pt-2 text-xs text-stone-lighter">Newton, MA</p>
                  </div>
                </div>

                {/* Bay State */}
                <div className="rounded-xl border border-stone/10 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-navy">Bay State Remodeling</h3>
                  <p className="mt-1 text-sm text-copper">Licensed Design-Build Contractor</p>
                  <div className="mt-4 space-y-2 text-sm text-stone-light">
                    <p>Zion Steinmetz</p>
                    <a href="tel:6179258925" className="block transition-colors hover:text-navy">
                      (617) 925-8925
                    </a>
                    <a href="mailto:info@baystateremodeling.com" className="block transition-colors hover:text-navy">
                      info@baystateremodeling.com
                    </a>
                    <p className="pt-2 text-xs text-stone-lighter">Serving Greater Boston</p>
                  </div>
                </div>
              </div>

              {/* General */}
              <div className="rounded-xl border border-stone/10 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-navy">Projecture General Inquiries</h3>
                <div className="mt-4 space-y-2 text-sm text-stone-light">
                  <a href="mailto:info@projecture.com" className="block transition-colors hover:text-navy">
                    info@projecture.com
                  </a>
                  <p className="text-xs text-stone-lighter">Newton, MA</p>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-stone/10 bg-cream-dark flex items-center justify-center">
                <div className="text-center text-stone-lighter/40">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto">
                    <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M24 44S8 28 8 20a16 16 0 1132 0c0 8-16 24-16 24z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p className="mt-2 text-xs">Newton, MA</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-stone/10 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-navy">Send Us a Message</h2>
              <p className="mt-2 text-sm text-stone-light">
                We typically respond within 24 hours.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
