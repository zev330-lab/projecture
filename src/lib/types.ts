export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  interest: "buying" | "selling" | "both" | "curious" | null;
  target_towns: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  bedrooms_min: number | null;
  notes: string | null;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  created_at: string;
  updated_at: string;
}

export type PropertyStatus =
  | "intake"
  | "sarina_review"
  | "zion_review"
  | "margin_analysis"
  | "approved"
  | "published"
  | "under_contract"
  | "sold"
  | "rejected";

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  neighborhood: string | null;
  property_type: string | null;
  year_built: number | null;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lot_sqft: number | null;
  assessed_value: number | null;
  estimated_market_value: number | null;
  listing_price: number | null;
  listing_status:
    | "active"
    | "pending"
    | "sold"
    | "off_market"
    | "coming_soon"
    | null;
  mls_number: string | null;
  days_on_market: number | null;
  photos: string[] | null;
  description: string | null;
  renovation_score: number | null;
  featured: boolean;
  // New fields for finished-home model
  acquisition_cost: number | null;
  renovation_cost: number | null;
  target_margin: number | null;
  finished_price: number | null;
  finished_beds: number | null;
  finished_baths: number | null;
  finished_sqft: number | null;
  estimated_ready_date: string | null;
  property_status: PropertyStatus;
  teaser_description: string | null;
  full_description: string | null;
  included_features: string[] | null;
  sarina_notes: string | null;
  zion_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RenovationConcept {
  id: string;
  property_id: string;
  title: string;
  description: string | null;
  scope: string[] | null;
  estimated_cost_low: number | null;
  estimated_cost_high: number | null;
  estimated_timeline_weeks: number | null;
  estimated_arv: number | null;
  roi_percentage: number | null;
  render_urls: string[] | null;
  floor_plan_url: string | null;
  status: "draft" | "review" | "approved" | "published";
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostItem {
  id: string;
  concept_id: string;
  category: string;
  item_name: string;
  item_type: "labor" | "material" | "permit" | "professional" | "equipment";
  cost_low: number | null;
  cost_high: number | null;
  unit: string | null;
  quantity: number | null;
  notes: string | null;
  created_at: string;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  details: Record<string, unknown> | null;
  property_id: string | null;
  status: string;
  tokens_used: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface BuyerProfile {
  id: string;
  lead_id: string | null;
  target_towns: string[] | null;
  property_types: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  renovation_budget_max: number | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  deal_breakers: string[] | null;
  timeline: string | null;
  financing_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  status: "draft" | "review" | "published";
  author: string | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyWithConcepts extends Property {
  renovation_concepts: (RenovationConcept & { cost_items: CostItem[] })[];
}
