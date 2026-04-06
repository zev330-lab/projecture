"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input, { Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Table, TableHead, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import type { RenovationConcept, Property } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

const statusVariant: Record<string, "default" | "copper" | "success" | "warning"> = {
  draft: "default",
  review: "warning",
  approved: "copper",
  published: "success",
};

const emptyForm = {
  property_id: "",
  title: "",
  description: "",
  scope: "",
  estimated_cost_low: "",
  estimated_cost_high: "",
  estimated_timeline_weeks: "",
  estimated_arv: "",
  roi_percentage: "",
  status: "draft",
};

export default function DashboardConceptsPage() {
  const [concepts, setConcepts] = useState<(RenovationConcept & { property?: Property })[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RenovationConcept | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [conceptsResult, propertiesResult] = await Promise.all([
      supabase.from("renovation_concepts").select("*, property:properties(*)").order("created_at", { ascending: false }),
      supabase.from("properties").select("*").order("address"),
    ]);

    setConcepts((conceptsResult.data as (RenovationConcept & { property?: Property })[]) || []);
    setProperties((propertiesResult.data as Property[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: RenovationConcept) {
    setEditing(c);
    setForm({
      property_id: c.property_id,
      title: c.title,
      description: c.description || "",
      scope: c.scope?.join(", ") || "",
      estimated_cost_low: c.estimated_cost_low?.toString() || "",
      estimated_cost_high: c.estimated_cost_high?.toString() || "",
      estimated_timeline_weeks: c.estimated_timeline_weeks?.toString() || "",
      estimated_arv: c.estimated_arv?.toString() || "",
      roi_percentage: c.roi_percentage?.toString() || "",
      status: c.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();

    const payload = {
      property_id: form.property_id,
      title: form.title,
      description: form.description || null,
      scope: form.scope ? form.scope.split(",").map((s) => s.trim()) : null,
      estimated_cost_low: form.estimated_cost_low ? parseInt(form.estimated_cost_low) : null,
      estimated_cost_high: form.estimated_cost_high ? parseInt(form.estimated_cost_high) : null,
      estimated_timeline_weeks: form.estimated_timeline_weeks ? parseInt(form.estimated_timeline_weeks) : null,
      estimated_arv: form.estimated_arv ? parseInt(form.estimated_arv) : null,
      roi_percentage: form.roi_percentage ? parseFloat(form.roi_percentage) : null,
      status: form.status,
    };

    if (editing) {
      await supabase.from("renovation_concepts").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("renovation_concepts").insert(payload);
    }

    setModalOpen(false);
    fetchData();
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("renovation_concepts").update({ status }).eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Renovation Concepts</h1>
          <p className="mt-1 text-sm text-slate-light">
            {concepts.length} {concepts.length === 1 ? "concept" : "concepts"}
          </p>
        </div>
        <Button onClick={openCreate}>Add Concept</Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-light">Loading...</div>
      ) : concepts.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">No renovation concepts yet. Add a property first, then create concepts.</p>
          <Button onClick={openCreate} className="mt-4">Add Concept</Button>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Property</TableHeaderCell>
              <TableHeaderCell>Cost Range</TableHeaderCell>
              <TableHeaderCell>ARV</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {concepts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell className="text-slate-light">
                  {(c as { property?: Property }).property?.address || "—"}
                </TableCell>
                <TableCell className="text-slate-light">
                  {formatPrice(c.estimated_cost_low)} – {formatPrice(c.estimated_cost_high)}
                </TableCell>
                <TableCell className="text-slate-light">{formatPrice(c.estimated_arv)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[c.status] || "default"}>{c.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    {c.status === "draft" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "review")}>
                        Submit
                      </Button>
                    )}
                    {c.status === "review" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "approved")}>
                        Approve
                      </Button>
                    )}
                    {c.status === "approved" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, "published")}>
                        Publish
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Concept" : "Add Concept"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Property"
            value={form.property_id}
            onChange={(e) => setForm({ ...form, property_id: e.target.value })}
            required
          >
            <option value="">Select a property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.city}
              </option>
            ))}
          </Select>

          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Modern Open Concept, Classic Luxury Update..."
            required
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />

          <Input
            label="Scope (comma-separated)"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            placeholder="kitchen, primary_bath, basement, exterior"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost Low"
              type="number"
              value={form.estimated_cost_low}
              onChange={(e) => setForm({ ...form, estimated_cost_low: e.target.value })}
            />
            <Input
              label="Cost High"
              type="number"
              value={form.estimated_cost_high}
              onChange={(e) => setForm({ ...form, estimated_cost_high: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Timeline (weeks)"
              type="number"
              value={form.estimated_timeline_weeks}
              onChange={(e) => setForm({ ...form, estimated_timeline_weeks: e.target.value })}
            />
            <Input
              label="ARV"
              type="number"
              value={form.estimated_arv}
              onChange={(e) => setForm({ ...form, estimated_arv: e.target.value })}
            />
            <Input
              label="ROI %"
              type="number"
              step="0.01"
              value={form.roi_percentage}
              onChange={(e) => setForm({ ...form, roi_percentage: e.target.value })}
            />
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </Select>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Add Concept"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
