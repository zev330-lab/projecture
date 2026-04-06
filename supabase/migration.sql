-- Projecture Database Schema
-- Run this in Supabase SQL Editor after creating the project

-- Leads from the website
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT CHECK (interest IN ('buying', 'selling', 'both', 'curious')),
  target_towns TEXT[],
  budget_min INTEGER,
  budget_max INTEGER,
  bedrooms_min INTEGER,
  notes TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties in the system
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'MA',
  zip TEXT,
  neighborhood TEXT,
  property_type TEXT,
  year_built INTEGER,
  sqft INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  lot_sqft INTEGER,
  assessed_value INTEGER,
  estimated_market_value INTEGER,
  listing_price INTEGER,
  listing_status TEXT CHECK (listing_status IN ('active', 'pending', 'sold', 'off_market', 'coming_soon')),
  mls_number TEXT,
  days_on_market INTEGER,
  photos TEXT[],
  description TEXT,
  renovation_score INTEGER CHECK (renovation_score >= 0 AND renovation_score <= 100),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Renovation concepts for properties
CREATE TABLE renovation_concepts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scope TEXT[],
  estimated_cost_low INTEGER,
  estimated_cost_high INTEGER,
  estimated_timeline_weeks INTEGER,
  estimated_arv INTEGER,
  roi_percentage NUMERIC(5,2),
  render_urls TEXT[],
  floor_plan_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost line items for each renovation concept
CREATE TABLE cost_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id UUID REFERENCES renovation_concepts(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT CHECK (item_type IN ('labor', 'material', 'permit', 'professional', 'equipment')),
  cost_low INTEGER,
  cost_high INTEGER,
  unit TEXT,
  quantity NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent activity logs
CREATE TABLE agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  property_id UUID REFERENCES properties(id),
  status TEXT DEFAULT 'completed',
  tokens_used INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches / buyer profiles
CREATE TABLE buyer_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id),
  target_towns TEXT[],
  property_types TEXT[],
  budget_min INTEGER,
  budget_max INTEGER,
  renovation_budget_max INTEGER,
  bedrooms_min INTEGER,
  bathrooms_min NUMERIC(3,1),
  must_haves TEXT[],
  nice_to_haves TEXT[],
  deal_breakers TEXT[],
  timeline TEXT,
  financing_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content for blog/case studies
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT,
  excerpt TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published')),
  author TEXT,
  featured_image TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Properties: public read for published, auth required for write
CREATE POLICY "Public can read properties" ON properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage properties" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

-- Renovation concepts: public read for published, auth required for write
CREATE POLICY "Public can read published concepts" ON renovation_concepts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage concepts" ON renovation_concepts
  FOR ALL USING (auth.role() = 'authenticated');

-- Cost items: public read (via concept), auth required for write
CREATE POLICY "Public can read cost items" ON cost_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM renovation_concepts
      WHERE renovation_concepts.id = cost_items.concept_id
      AND renovation_concepts.status = 'published'
    )
  );

CREATE POLICY "Authenticated users can manage cost items" ON cost_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Leads: only authenticated users can read/write
CREATE POLICY "Authenticated users can manage leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous inserts for lead capture forms
CREATE POLICY "Anyone can submit leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Agent logs: authenticated only
CREATE POLICY "Authenticated users can manage agent logs" ON agent_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Buyer profiles: authenticated only
CREATE POLICY "Authenticated users can manage buyer profiles" ON buyer_profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- Content: public read for published, auth for write
CREATE POLICY "Public can read published content" ON content
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage content" ON content
  FOR ALL USING (auth.role() = 'authenticated');
