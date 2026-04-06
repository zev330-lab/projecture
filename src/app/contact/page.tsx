import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import ContactForm from "@/components/lead/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Projecture",
  description: "Get in touch with the Projecture team. Whether you're buying, selling, or just curious.",
};

export default function ContactPage() {
  return (
    <main className="pt-24">
      {/* Header */}
      <section className="py-16 md:py-24">
        <Container size="md">
          <div className="text-center">
            <p className="mb-4 text-sm font-medium tracking-[0.25em] uppercase text-copper">
              Contact Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Let&apos;s Talk
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-light">
              Whether you&apos;re ready to explore properties or just want to learn more about what we do — we&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="pb-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Steinmetz RE */}
                <div className="rounded-xl border border-white/5 bg-navy-light/40 p-6">
                  <h3 className="font-bold text-warm-white">Steinmetz Real Estate</h3>
                  <p className="mt-1 text-sm text-copper">William Raveis</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-light">
                    <p>Sarina &amp; Zev Steinmetz</p>
                    <a href="tel:6175551234" className="block transition-colors hover:text-warm-white">
                      (617) 244-1366
                    </a>
                    <a href="mailto:sarina@steinmetzrealestate.com" className="block transition-colors hover:text-warm-white">
                      sarina@steinmetzrealestate.com
                    </a>
                    <p className="pt-2 text-xs text-slate">Newton, MA</p>
                  </div>
                </div>

                {/* Bay State */}
                <div className="rounded-xl border border-white/5 bg-navy-light/40 p-6">
                  <h3 className="font-bold text-warm-white">Bay State Remodeling</h3>
                  <p className="mt-1 text-sm text-copper">Licensed Design-Build Contractor</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-light">
                    <p>Zion Steinmetz</p>
                    <a href="tel:6175551234" className="block transition-colors hover:text-warm-white">
                      (617) 925-8925
                    </a>
                    <a href="mailto:info@baystateremodeling.com" className="block transition-colors hover:text-warm-white">
                      info@baystateremodeling.com
                    </a>
                    <p className="pt-2 text-xs text-slate">Serving Greater Boston</p>
                  </div>
                </div>
              </div>

              {/* General */}
              <div className="rounded-xl border border-white/5 bg-navy-light/40 p-6">
                <h3 className="font-bold text-warm-white">Projecture General Inquiries</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-light">
                  <a href="mailto:info@projecture.com" className="block transition-colors hover:text-warm-white">
                    info@projecture.com
                  </a>
                  <p className="text-xs text-slate">Newton, MA — Launching Spring 2026</p>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="aspect-[16/9] overflow-hidden rounded-xl border border-white/5 bg-navy-light/40 flex items-center justify-center">
                <div className="text-center text-slate/40">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto">
                    <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
                    <path d="M24 44S8 28 8 20a16 16 0 1132 0c0 8-16 24-16 24z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <p className="mt-2 text-xs">Newton, MA</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-white/5 bg-navy-light/40 p-8">
              <h2 className="text-xl font-bold">Send Us a Message</h2>
              <p className="mt-2 text-sm text-slate-light">
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
