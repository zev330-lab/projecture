# Projecture

## What This Is
Future-state property marketplace. Buyers see what homes could become post-renovation with AI visualization, accurate costs, and turnkey execution. Joint venture between Steinmetz Real Estate and Bay State Remodeling.

## Deployed
https://projecture.vercel.app

## GitHub
zev330-lab/projecture

## Current State
Phase 1: Foundation build — full site, Supabase backend, dashboard, auth

## Tech Stack
Next.js 16, TypeScript, Tailwind CSS v4, Supabase (auth + DB), Vercel

## Environment Variables
Set these in .env.local (and Vercel dashboard):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `ANTHROPIC_API_KEY` — Claude API key (Phase 3)
- `CRON_SECRET` — Secret for cron job auth (Phase 3)
- `RESEND_API_KEY` — Resend email service (future)

## Setup Steps (for new environments)
1. Create Supabase project at supabase.com, name it "projecture"
2. Run `supabase/migration.sql` in Supabase SQL Editor
3. Create admin user in Supabase Auth dashboard
4. Copy Supabase URL, anon key, service role key to .env.local
5. Set same env vars in Vercel dashboard
6. `npm install && npm run dev`

## Working Rules
- Read this file at the start of every session
- Update this file after every significant change
- Conventional commit messages
- Never leave work in a broken state

@AGENTS.md

## Project Structure
```
src/
├── app/
│   ├── page.tsx                # Home — premium landing page
│   ├── layout.tsx              # Root layout with DM Sans + Inter, Navbar, Footer
│   ├── globals.css             # Tailwind theme, animations
│   ├── about/page.tsx          # About the venture and team
│   ├── contact/page.tsx        # Contact form + partner info
│   ├── how-it-works/page.tsx   # 4-step process + FAQ
│   ├── login/page.tsx          # Supabase auth login
│   ├── properties/
│   │   ├── page.tsx            # Property listing (coming soon state)
│   │   └── [id]/page.tsx       # Property detail with concepts
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── page.tsx            # Overview — stats, recent leads
│   │   ├── properties/page.tsx # CRUD properties
│   │   ├── leads/page.tsx      # Lead management
│   │   ├── concepts/page.tsx   # Renovation concept management
│   │   └── agents/page.tsx     # AI agent monitoring (Phase 3)
│   └── api/
│       ├── leads/route.ts      # POST leads (Formspree fallback)
│       ├── properties/route.ts # GET properties with filters
│       ├── properties/[id]/    # GET single property + concepts
│       ├── concepts/route.ts   # GET/POST renovation concepts
│       ├── cost-items/route.ts # GET/POST cost line items
│       └── dashboard/stats/    # GET dashboard summary
├── components/
│   ├── ui/                     # Button, Card, Input, Badge, Modal, Table
│   ├── layout/                 # Navbar, Footer, DashboardNav, Container
│   ├── property/               # PropertyCard, PropertyGrid, PropertyFilters, RenovationConcept
│   ├── lead/                   # LeadCaptureForm, ContactForm
│   └── dashboard/              # StatsCards, RecentLeads, AgentStatus
├── lib/
│   ├── types.ts                # TypeScript interfaces for all tables
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client + service client
│       └── middleware.ts       # Session management for auth
└── middleware.ts               # Protects /dashboard routes
```

## Lead Capture
- Primary: Supabase leads table via /api/leads
- Fallback: Formspree endpoint xvzbbrpb (when Supabase not configured)
- Forms on: homepage, properties page, property detail, contact page

## Auth
- Supabase Auth with email/password
- Middleware protects all /dashboard/* routes
- Login at /login, redirects to /dashboard on success
- Admin user must be manually created in Supabase Auth dashboard

## Design System
- Colors: Navy #0A1628, Warm White #F8F6F2, Copper #C17F59, Slate #64748B
- Typography: DM Sans (headings), Inter (body)
- Dark-mode-first luxury aesthetic
- Scroll-triggered fade-in animations
- Component library in src/components/ui/

## Database
- Schema in supabase/migration.sql
- Tables: leads, properties, renovation_concepts, cost_items, agent_logs, buyer_profiles, content
- RLS enabled on all tables with appropriate policies

## Recent Changes
- Phase 1 complete build: full site with 6 public pages, 5 dashboard pages, 6 API routes
- Supabase integration for auth, data, and lead capture
- Component library with luxury dark aesthetic
- Formspree fallback for lead capture when Supabase not configured

## Known Issues
- Next.js 16 deprecation warning: "middleware" → "proxy" migration recommended (still works)
- Supabase project needs to be created and credentials configured
- Dashboard CRUD operations require Supabase connection to function

## What's Next
Phase 2: Property Engine
- Create Supabase project and run migration
- Add 5 real Newton properties with renovation concepts
- AI visualization integration
- Cost estimation engine using Bay State data
- Property photo upload/management
