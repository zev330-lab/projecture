"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname === "/login") return null;

  return (
    <footer className="border-t border-white/5 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xl font-bold tracking-tight text-warm-white">Projecture</p>
            <p className="mt-2 text-sm text-slate">
              See beyond the listing. We show you what it could be. Then we build it.
            </p>
            <p className="mt-4 text-xs text-slate/70">
              A Steinmetz Real Estate &times; Bay State Remodeling venture
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">Explore</p>
            <div className="flex flex-col gap-2">
              <Link href="/how-it-works" className="text-sm text-slate-light transition-colors hover:text-warm-white">
                How It Works
              </Link>
              <Link href="/properties" className="text-sm text-slate-light transition-colors hover:text-warm-white">
                Properties
              </Link>
              <Link href="/about" className="text-sm text-slate-light transition-colors hover:text-warm-white">
                About
              </Link>
              <Link href="/contact" className="text-sm text-slate-light transition-colors hover:text-warm-white">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">Contact</p>
            <div className="flex flex-col gap-2 text-sm text-slate-light">
              <a href="mailto:info@projecture.com" className="transition-colors hover:text-warm-white">
                info@projecture.com
              </a>
              <p>Newton, MA</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-slate md:flex-row">
          <p>&copy; {new Date().getFullYear()} Projecture. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-warm-white">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-warm-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
