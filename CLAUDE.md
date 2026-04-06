# Projecture

## What This Is
A real estate listings platform for homes that don't exist yet — fully renovated homes delivered turnkey to buyers. Joint venture between Steinmetz Real Estate and Bay State Remodeling.

**Business Model:** We acquire properties below market, renovate them through Bay State Remodeling, and sell the finished product to buyers at an all-in price. The buyer sees the finished price, specs, timeline, and what's included. They do NOT see acquisition costs, renovation costs, or margins — those are internal only.

## Deployed
https://projecture.vercel.app

## GitHub
zev330-lab/projecture

## Current State
Phase 4: Complete business model redesign — properties-first homepage, finished-home listings, internal deal pipeline

## Tech Stack
Next.js 16, TypeScript, Tailwind CSS v4, Supabase (auth + DB), Vercel

## Environment Variables
Set these in .env.local (and Vercel dashboard):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `ANTHROPIC_API_KEY` — Claude API key (future)
- `CRON_SECRET` — Secret for cron job auth (future)
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

## Business Model (IMPORTANT)
The buyer experience is simple: browse beautiful listings of finished homes → see the all-in price → see the timeline → express interest.

**What the buyer sees (public site):**
- Finished home renders/photos
- All-in purchase price (finished_price)
- Timeline (estimated_ready_date)
- Finished specs (finished_beds, finished_baths, finished_sqft)
- What's included checklist (included_features)
- Current property photos + specs (secondary, smaller)
- Neighborhood info

**What the buyer does NOT see:**
- Acquisition cost
- Renovation cost
- Target margin
- Internal review notes (sarina_notes, zion_notes)
- Pipeline status details

**Internal workflow (dashboard only):**
1. Property identified → status: intake
2. Sarina reviews market opportunity → status: sarina_review
3. Zion estimates renovation cost → status: zion_review
4. Team calculates finished_price (acquisition + reno + margin) → status: margin_analysis
5. Team approves → status: approved
6. Published on site → status: published
7. Buyer commits → status: under_contract
8. Renovation complete, buyer closes → status: sold

## Project Structure
```
src/
├── app/
│   ├── page.tsx                # Home — server component, fetches published properties
│   ├── HomeClient.tsx          # Home — compact hero, filter bar, property grid, how-it-works, partners
│   ├── layout.tsx              # Root layout with Playfair Display + Inter, Navbar, Footer
│   ├── globals.css             # Tailwind theme (cream/stone/copper light palette), animations
│   ├── about/page.tsx          # About the venture, team, business model
│   ├── contact/page.tsx        # Contact form + partner info
│   ├── how-it-works/page.tsx   # 3-step process (Browse, Reserve, Move In) + FAQ
│   ├── login/page.tsx          # Supabase auth login
│   ├── properties/
│   │   ├── page.tsx            # Property listing (server: fetches published properties)
│   │   ├── PropertiesClient.tsx # Property listing (client: filters by finished_price, beds, village)
│   │   └── [id]/
│   │       ├── page.tsx        # Property detail — finished home first, current state secondary
│   │       └── MortgageCalculator.tsx # Simple mortgage calculator on finished_price
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout with sidebar (dark theme)
│   │   ├── page.tsx            # Overview — stats, recent leads
│   │   ├── properties/page.tsx # Deal pipeline — tabs by status, internal financials
│   │   ├── leads/page.tsx      # Lead management
│   │   ├── concepts/page.tsx   # Renovation concept management (internal)
│   │   └── agents/page.tsx     # AI agent monitoring (future)
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
│   ├── types.ts                # TypeScript interfaces — Property includes finished-home fields
│   ├── data/
│   │   ├── seed-data.json      # Fallback JSON data (20 properties with all new fields)
│   │   └── get-data.ts         # Data fetching — filters by property_status for public pages
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client + service client
│       └── middleware.ts       # Session management for auth
├── middleware.ts               # Protects /dashboard routes
scripts/
├── seed.cjs                    # Seeds properties, concepts, cost items into Supabase
supabase/
├── migration.sql               # Full database schema + RLS policies (includes new columns)
```

## Data Flow
- Public pages use `get-data.ts` which filters by property_status (published/under_contract/sold)
- Public pages show finished_price, finished_beds/baths/sqft — NEVER internal costs
- Dashboard pages use Supabase client directly (require auth) and show all fields
- Lead capture POSTs to /api/leads → Supabase (or Formspree fallback)

## Seed Data
- 20 Newton properties across 6 villages
- Each has: current specs + finished specs + internal financials + pipeline status
- Status distribution: 5 published, 5 approved, 5 sarina_review, 5 intake
- 5 featured properties with renovation concepts (internal) and cost items
- Property types: Colonial, Cape, Ranch, Split-Level, Victorian

## Property Status Pipeline
intake → sarina_review → zion_review → margin_analysis → approved → published → under_contract → sold
(rejected is a terminal state branching from any review stage)

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
- **Light theme** matching steinmetzrealestate.com
- Colors: Cream #FEFDFB (bg), Stone #44403C (body text), Navy #0D1421 (headings), Copper #C17F59 (accent)
- Typography: Playfair Display (headings, serif), Inter (body, sans-serif)
- White cards with subtle borders and shadows on cream background
- Scroll-triggered fade-in animations
- Property type gradient colors for placeholders (amber=colonial, emerald=cape, sky=ranch, violet=split-level, rose=victorian)
- Dashboard retains dark navy theme
- Component library in src/components/ui/

## Recent Changes
- Phase 4: Complete business model redesign
  - Changed from renovation cost calculator to finished-home listings platform
  - Buyer sees finished_price (all-in), timeline, finished specs, what's included
  - Buyer does NOT see acquisition costs, renovation costs, margins
  - Properties-first homepage with inline filter bar
  - 3-step "How It Works" (Browse, Reserve, Move In)
  - Property detail: finished home gallery → key details → mortgage calc → current state → what's included → team → interest form
  - Dashboard: deal pipeline with status tabs (Intake → Published → Sold)
  - New DB columns: acquisition_cost, renovation_cost, target_margin, finished_price, finished_beds/baths/sqft, property_status, estimated_ready_date, teaser_description, full_description, included_features, sarina_notes, zion_notes
  - PropertyCard shows status badge, timeline badge, finished_price, finished specs
  - MortgageCalculator (simplified from FinancingCalculator — no renovation budget input)
  - Updated Navbar CTA to "I'm Interested"
  - Updated all page copy for finished-home model

## Known Issues
- Next.js 16 deprecation warning: "middleware" → "proxy" migration recommended (still works)
- Dashboard CRUD requires Supabase connection
- Photos are placeholder gradients — need real property photos or AI renders
- Supabase env vars must be set in Vercel dashboard for production

## What's Next
Phase 5: AI Agents & Visualization
- Property Scout agent (scans public records for acquisition candidates)
- Visualization Engine (AI-generated renders of finished homes)
- Market Analyzer (ARV calculations, comp analysis)
- Agent monitoring in dashboard
- Real photography / AI renders to replace gradient placeholders
