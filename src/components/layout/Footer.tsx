"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  return (
    <footer className="border-t border-stone/10 bg-cream-dark px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold tracking-tight text-navy font-[family-name:var(--font-heading)]">Projecture</p>
            <p className="mt-2 text-sm text-stone-light">
              Fully renovated homes in Newton. Designed, built, and delivered by our team.
            </p>
            <p className="mt-4 text-xs text-stone-lighter">
              A Steinmetz Real Estate &times; Bay State Remodeling venture
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-lighter">Explore</p>
            <div className="flex flex-col gap-2">
              <Link href="/how-it-works" className="text-sm text-stone-light transition-colors hover:text-navy">
                How It Works
              </Link>
              <Link href="/properties" className="text-sm text-stone-light transition-colors hover:text-navy">
                Properties
              </Link>
              <Link href="/about" className="text-sm text-stone-light transition-colors hover:text-navy">
                About
              </Link>
              <Link href="/contact" className="text-sm text-stone-light transition-colors hover:text-navy">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-lighter">Contact</p>
            <div className="flex flex-col gap-2 text-sm text-stone-light">
              <a href="mailto:info@projecture.com" className="transition-colors hover:text-navy">
                info@projecture.com
              </a>
              <p>Newton, MA</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone/10 pt-8 text-xs text-stone-lighter md:flex-row">
          <p>&copy; {new Date().getFullYear()} Projecture. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-navy">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-navy">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
