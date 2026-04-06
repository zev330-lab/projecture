"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input, { Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Table, TableHead, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import type { Property, PropertyStatus } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const pipelineStatuses: { value: PropertyStatus; label: string; variant: "default" | "copper" | "success" | "warning" | "danger" }[] = [
  { value: "intake", label: "Intake", variant: "default" },
  { value: "sarina_review", label: "Sarina Review", variant: "copper" },
  { value: "zion_review", label: "Zion Review", variant: "copper" },
  { value: "margin_analysis", label: "Margin Analysis", variant: "warning" },
  { value: "approved", label: "Approved", variant: "success" },
  { value: "published", label: "Published", variant: "success" },
  { value: "under_contract", label: "Under Contract", variant: "warning" },
  { value: "sold", label: "Sold", variant: "default" },
  { value: "rejected", label: "Rejected", variant: "danger" },
];

const statusVariant: Record<string, "default" | "copper" | "success" | "warning" | "danger"> = Object.fromEntries(
  pipelineStatuses.map((s) => [s.value, s.variant])
);

const emptyProperty = {
  address: "",
  city: "Newton",
  state: "MA",
  zip: "",
  neighborhood: "",
  property_type: "",
  year_built: "",
  sqft: "",
  bedrooms: "",
  bathrooms: "",
  lot_sqft: "",
  listing_price: "",
  listing_status: "off_market",
  description: "",
  featured: false,
  property_status: "intake" as PropertyStatus,
  acquisition_cost: "",
  renovation_cost: "",
  target_margin: "",
  finished_price: "",
  finished_beds: "",
  finished_baths: "",
  finished_sqft: "",
  estimated_ready_date: "",
  teaser_description: "",
  full_description: "",
  included_features: "",
  sarina_notes: "",
  zion_notes: "",
};

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PropertyStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyProperty);

  const fetchProperties = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    setProperties((data as Property[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filtered = activeTab === "all"
    ? properties
    : properties.filter((p) => p.property_status === activeTab);

  const statusCounts = pipelineStatuses.reduce(
    (acc, s) => {
      acc[s.value] = properties.filter((p) => p.property_status === s.value).length;
      return acc;
    },
    {} as Record<string, number>
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyProperty);
    setModalOpen(true);
  }

  function openEdit(p: Property) {
    setEditing(p);
    setForm({
      address: p.address,
      city: p.city,
      state: p.state,
      zip: p.zip || "",
      neighborhood: p.neighborhood || "",
      property_type: p.property_type || "",
      year_built: p.year_built?.toString() || "",
      sqft: p.sqft?.toString() || "",
      bedrooms: p.bedrooms?.toString() || "",
      bathrooms: p.bathrooms?.toString() || "",
      lot_sqft: p.lot_sqft?.toString() || "",
      listing_price: p.listing_price?.toString() || "",
      listing_status: p.listing_status || "off_market",
      description: p.description || "",
      featured: p.featured,
      property_status: p.property_status,
      acquisition_cost: p.acquisition_cost?.toString() || "",
      renovation_cost: p.renovation_cost?.toString() || "",
      target_margin: p.target_margin?.toString() || "",
      finished_price: p.finished_price?.toString() || "",
      finished_beds: p.finished_beds?.toString() || "",
      finished_baths: p.finished_baths?.toString() || "",
      finished_sqft: p.finished_sqft?.toString() || "",
      estimated_ready_date: p.estimated_ready_date || "",
      teaser_description: p.teaser_description || "",
      full_description: p.full_description || "",
      included_features: (p.included_features || []).join("\n"),
      sarina_notes: p.sarina_notes || "",
      zion_notes: p.zion_notes || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();

    const payload = {
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip || null,
      neighborhood: form.neighborhood || null,
      property_type: form.property_type || null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      sqft: form.sqft ? parseInt(form.sqft) : null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      lot_sqft: form.lot_sqft ? parseInt(form.lot_sqft) : null,
      listing_price: form.listing_price ? parseInt(form.listing_price) : null,
      listing_status: form.listing_status,
      description: form.description || null,
      featured: form.featured,
      property_status: form.property_status,
      acquisition_cost: form.acquisition_cost ? parseInt(form.acquisition_cost) : null,
      renovation_cost: form.renovation_cost ? parseInt(form.renovation_cost) : null,
      target_margin: form.target_margin ? parseInt(form.target_margin) : null,
      finished_price: form.finished_price ? parseInt(form.finished_price) : null,
      finished_beds: form.finished_beds ? parseInt(form.finished_beds) : null,
      finished_baths: form.finished_baths ? parseFloat(form.finished_baths) : null,
      finished_sqft: form.finished_sqft ? parseInt(form.finished_sqft) : null,
      estimated_ready_date: form.estimated_ready_date || null,
      teaser_description: form.teaser_description || null,
      full_description: form.full_description || null,
      included_features: form.included_features ? form.included_features.split("\n").filter(Boolean) : null,
      sarina_notes: form.sarina_notes || null,
      zion_notes: form.zion_notes || null,
    };

    if (editing) {
      await supabase.from("properties").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("properties").insert(payload);
    }

    setModalOpen(false);
    fetchProperties();
  }

  async function advanceStatus(p: Property) {
    const order: PropertyStatus[] = [
      "intake", "sarina_review", "zion_review", "margin_analysis", "approved", "published",
    ];
    const idx = order.indexOf(p.property_status);
    if (idx < 0 || idx >= order.length - 1) return;

    const supabase = createClient();
    await supabase
      .from("properties")
      .update({ property_status: order[idx + 1] })
      .eq("id", p.id);
    fetchProperties();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="mt-1 text-sm text-slate-light">
            {properties.length} {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Button onClick={openCreate}>Add Property</Button>
      </div>

      {/* Pipeline tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "all" ? "bg-copper text-white" : "bg-white/5 text-slate-light hover:text-white"
          }`}
        >
          All ({properties.length})
        </button>
        {pipelineStatuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveTab(s.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === s.value ? "bg-copper text-white" : "bg-white/5 text-slate-light hover:text-white"
            }`}
          >
            {s.label} ({statusCounts[s.value] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-light">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">No properties in this stage.</p>
          <Button onClick={openCreate} className="mt-4">Add Property</Button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Address</TableHeaderCell>
              <TableHeaderCell>Village</TableHeaderCell>
              <TableHeaderCell>Acquisition</TableHeaderCell>
              <TableHeaderCell>Reno Cost</TableHeaderCell>
              <TableHeaderCell>Margin</TableHeaderCell>
              <TableHeaderCell>Finished Price</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.address}</TableCell>
                <TableCell className="text-slate-light">{p.neighborhood || p.city}</TableCell>
                <TableCell>{formatPrice(p.acquisition_cost)}</TableCell>
                <TableCell>{formatPrice(p.renovation_cost)}</TableCell>
                <TableCell>{formatPrice(p.target_margin)}</TableCell>
                <TableCell className="font-semibold text-copper">{formatPrice(p.finished_price)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.property_status] || "default"}>
                    {pipelineStatuses.find((s) => s.value === p.property_status)?.label || p.property_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    {["intake", "sarina_review", "zion_review", "margin_analysis", "approved"].includes(p.property_status) && (
                      <Button variant="ghost" size="sm" onClick={() => advanceStatus(p)}>Advance</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Property" : "Add Property"}>
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <Input label="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Neighborhood" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            <Input label="Property Type" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} placeholder="colonial, cape..." />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Input label="Year Built" type="number" value={form.year_built} onChange={(e) => setForm({ ...form, year_built: e.target.value })} />
            <Input label="Sqft" type="number" value={form.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} />
            <Input label="Beds" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            <Input label="Baths" type="number" step="0.5" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
          </div>

          {/* Internal financials */}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-stone-lighter">Internal Financials</p>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Acquisition Cost" type="number" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} />
            <Input label="Renovation Cost" type="number" value={form.renovation_cost} onChange={(e) => setForm({ ...form, renovation_cost: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Target Margin" type="number" value={form.target_margin} onChange={(e) => setForm({ ...form, target_margin: e.target.value })} />
            <Input label="Finished Price" type="number" value={form.finished_price} onChange={(e) => setForm({ ...form, finished_price: e.target.value })} />
          </div>

          {/* Finished specs */}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-stone-lighter">Finished Specs</p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Fin. Beds" type="number" value={form.finished_beds} onChange={(e) => setForm({ ...form, finished_beds: e.target.value })} />
            <Input label="Fin. Baths" type="number" step="0.5" value={form.finished_baths} onChange={(e) => setForm({ ...form, finished_baths: e.target.value })} />
            <Input label="Fin. Sqft" type="number" value={form.finished_sqft} onChange={(e) => setForm({ ...form, finished_sqft: e.target.value })} />
          </div>
          <Input label="Ready Date" type="date" value={form.estimated_ready_date} onChange={(e) => setForm({ ...form, estimated_ready_date: e.target.value })} />

          {/* Pipeline status */}
          <Select
            label="Pipeline Status"
            value={form.property_status}
            onChange={(e) => setForm({ ...form, property_status: e.target.value as PropertyStatus })}
          >
            {pipelineStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>

          {/* Review notes */}
          <Textarea label="Sarina's Notes" value={form.sarina_notes} onChange={(e) => setForm({ ...form, sarina_notes: e.target.value })} rows={2} />
          <Textarea label="Zion's Notes" value={form.zion_notes} onChange={(e) => setForm({ ...form, zion_notes: e.target.value })} rows={2} />

          {/* Public-facing content */}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-stone-lighter">Public Content</p>
          <Input label="Teaser (card)" value={form.teaser_description} onChange={(e) => setForm({ ...form, teaser_description: e.target.value })} />
          <Textarea label="Full Description" value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} rows={3} />
          <Textarea label="Included Features (one per line)" value={form.included_features} onChange={(e) => setForm({ ...form, included_features: e.target.value })} rows={4} />
          <Textarea label="Current Property Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Property"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
