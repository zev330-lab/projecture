"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input, { Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Table, TableHead, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import type { Property } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const statusVariant: Record<string, "success" | "copper" | "default" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  sold: "default",
  off_market: "danger",
  coming_soon: "copper",
};

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
  listing_status: "coming_soon",
  description: "",
  featured: false,
};

export default function DashboardPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
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
      listing_status: p.listing_status || "coming_soon",
      description: p.description || "",
      featured: p.featured,
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
    };

    if (editing) {
      await supabase.from("properties").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("properties").insert(payload);
    }

    setModalOpen(false);
    fetchProperties();
  }

  async function toggleFeatured(p: Property) {
    const supabase = createClient();
    await supabase.from("properties").update({ featured: !p.featured }).eq("id", p.id);
    fetchProperties();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="mt-1 text-sm text-slate-light">
            {properties.length} {properties.length === 1 ? "property" : "properties"}
          </p>
        </div>
        <Button onClick={openCreate}>Add Property</Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-light">Loading...</div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">No properties yet. Add your first property to get started.</p>
          <Button onClick={openCreate} className="mt-4">Add Property</Button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Address</TableHeaderCell>
              <TableHeaderCell>City</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Featured</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {properties.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.address}</TableCell>
                <TableCell className="text-slate-light">{p.city}</TableCell>
                <TableCell>{formatPrice(p.listing_price)}</TableCell>
                <TableCell>
                  {p.listing_status && (
                    <Badge variant={statusVariant[p.listing_status] || "default"}>
                      {p.listing_status === "coming_soon" ? "Coming Soon" : p.listing_status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`text-sm ${p.featured ? "text-copper" : "text-slate"} hover:text-copper-light`}
                  >
                    {p.featured ? "Yes" : "No"}
                  </button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Property" : "Add Property"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <Input
              label="ZIP"
              value={form.zip}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Neighborhood"
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            />
            <Input
              label="Property Type"
              value={form.property_type}
              onChange={(e) => setForm({ ...form, property_type: e.target.value })}
              placeholder="colonial, cape, ranch..."
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Input
              label="Year Built"
              type="number"
              value={form.year_built}
              onChange={(e) => setForm({ ...form, year_built: e.target.value })}
            />
            <Input
              label="Sqft"
              type="number"
              value={form.sqft}
              onChange={(e) => setForm({ ...form, sqft: e.target.value })}
            />
            <Input
              label="Beds"
              type="number"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
            />
            <Input
              label="Baths"
              type="number"
              step="0.5"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Listing Price"
              type="number"
              value={form.listing_price}
              onChange={(e) => setForm({ ...form, listing_price: e.target.value })}
            />
            <Select
              label="Status"
              value={form.listing_status}
              onChange={(e) => setForm({ ...form, listing_status: e.target.value })}
            >
              <option value="coming_soon">Coming Soon</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="off_market">Off Market</option>
            </Select>
          </div>
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
          <label className="flex items-center gap-2 text-sm text-slate-light">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded border-white/10"
            />
            Featured property
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Property"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
