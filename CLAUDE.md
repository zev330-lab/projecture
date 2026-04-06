# Projecture

## What This Is
Future-state property marketplace. Buyers see what homes could become post-renovation with AI visualization, accurate costs, and turnkey execution. Joint venture between Steinmetz Real Estate and Bay State Remodeling.

## Deployed
https://projecture.vercel.app

## GitHub
zev330-lab/projecture

## Current State
Phase 2: Property Engine — 20 properties, 8 concepts, 200 cost items, functional marketplace

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

## Supabase
- Project: projecture (qymkdtmfatxaobhikgqu)
- Schema: supabase/migration.sql
- Seed: scripts/seed.cjs (run with `export $(grep -v '^#' .env.local | grep -v '^$' | xargs) && node scripts/seed.cjs`)
- Tables: leads, properties, renovation_concepts, cost_items, agent_logs, buyer_profiles, content
- RLS enabled on all tables

## Setup Steps (for new environments)
1. Create Supabase project at supabase.com, name it "projecture"
2. Run `supabase/migration.sql` in Supabase SQL Editor
3. Create admin user in Supabase Auth dashboard
4. Copy Supabase URL, anon key, service role key to .env.local
5. Set same env vars in Vercel dashboard
6. `npm install && npm run dev`
7. Seed data: `export $(grep -v '^#' .env.local | grep -v '^$' | xargs) && node scripts/seed.cjs`

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
│   ├── page.tsx                # Home — server component, fetches featured properties
│   ├── HomeClient.tsx          # Home — client component with scroll animations
│   ├── layout.tsx              # Root layout with DM Sans + Inter, Navbar, Footer
│   ├── globals.css             # Tailwind theme, animations
│   ├── about/page.tsx          # About the venture and team
│   ├── contact/page.tsx        # Contact form + partner info
│   ├── how-it-works/page.tsx   # 4-step process + FAQ
│   ├── login/page.tsx          # Supabase auth login
│   ├── properties/
│   │   ├── page.tsx            # Property listing (server: fetches data)
│   │   ├── PropertiesClient.tsx # Property listing (client: filters, sort, grid)
│   │   └── [id]/
│   │       ├── page.tsx        # Property detail with concepts, financial summary
│   │       └── FinancingCalculator.tsx # Mortgage/renovation calculator
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
│   ├── data/
│   │   ├── seed-data.json      # Fallback JSON data (20 properties, concepts, cost templates)
│   │   └── get-data.ts         # Data fetching with Supabase → JSON fallback
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client + service client
│       └── middleware.ts       # Session management for auth
├── middleware.ts               # Protects /dashboard routes
scripts/
├── seed.cjs                    # Seeds properties, concepts, cost items into Supabase
supabase/
├── migration.sql               # Full database schema + RLS policies
```

## Data Flow
- All public pages use `src/lib/data/get-data.ts` which tries Supabase first, falls back to JSON
- Dashboard pages use Supabase client directly (require auth)
- Lead capture POSTs to /api/leads → Supabase (or Formspree fallback)

## Seed Data
- 20 Newton properties across 6 villages (Newton Center, West Newton, Waban, Newton Highlands, Chestnut Hill, Newtonville)
- 5 featured properties with 8 renovation concepts (mix of full reno + targeted updates)
- 200 cost line items across kitchen, bath, basement, exterior, systems categories
- Property types: Colonial, Cape, Ranch, Split-Level, Victorian
- Years built: 1890-1962
- Price range: $932K-$1.93M

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
- Property type gradient colors (amber=colonial, sky=cape, emerald=ranch, violet=split-level, rose=victorian)
- Component library in src/components/ui/

## Recent Changes
- Phase 2: Property Engine complete
  - 20 Newton properties seeded with realistic data
  - 8 renovation concepts with 200 cost line items
  - Functional property marketplace with filters (village, type, price, beds, sort)
  - Property detail page with "What It Could Become" concepts, cost breakdowns, financial summary
  - Financing calculator (mortgage + renovation loan estimator)
  - Dynamic featured properties on homepage (pulls from Supabase)
  - JSON fallback for all data — site renders even without Supabase
  - Property cards with type-based gradient colors and renovation score badges

## Known Issues
- Next.js 16 deprecation warning: "middleware" → "proxy" migration recommended (still works)
- Dashboard CRUD requires Supabase connection
- Photos are placeholder gradients — need real property photos or AI renders
- Supabase env vars must be set in Vercel dashboard for production

## What's Next
Phase 3: AI Agents
- Property Scout agent (scans for new opportunities)
- Cost Estimator agent (generates renovation breakdowns)
- Visualization Engine (AI-generated renders)
- Market Analyzer (ARV and ROI calculations)
- Agent monitoring in dashboard
