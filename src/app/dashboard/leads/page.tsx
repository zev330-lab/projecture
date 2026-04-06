"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Select, Textarea } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Table, TableHead, TableRow, TableCell, TableHeaderCell } from "@/components/ui/Table";
import type { Lead } from "@/lib/types";

const statusOptions = ["new", "contacted", "qualified", "converted", "closed"] as const;
const statusVariant: Record<string, "default" | "copper" | "success" | "warning" | "danger"> = {
  new: "copper",
  contacted: "default",
  qualified: "warning",
  converted: "success",
  closed: "danger",
};

export default function DashboardLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (filter) {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setLeads((data as Lead[]) || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function viewLead(lead: Lead) {
    setSelectedLead(lead);
    setModalOpen(true);
  }

  async function updateStatus(leadId: string, status: string) {
    const supabase = createClient();
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", leadId);
    fetchLeads();
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: status as Lead["status"] });
    }
  }

  async function updateNotes(leadId: string, notes: string) {
    const supabase = createClient();
    await supabase.from("leads").update({ notes, updated_at: new Date().toISOString() }).eq("id", leadId);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="mt-1 text-sm text-slate-light">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
          </p>
        </div>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-light">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-navy-light/60 p-12 text-center">
          <p className="text-slate-light">No leads yet. They&apos;ll appear here when people submit forms on the site.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Interest</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  {lead.first_name} {lead.last_name}
                </TableCell>
                <TableCell className="text-slate-light">{lead.email}</TableCell>
                <TableCell className="capitalize text-slate-light">{lead.interest || "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[lead.status] || "default"}>{lead.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-slate">
                  {new Date(lead.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => viewLead(lead)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedLead ? `${selectedLead.first_name} ${selectedLead.last_name || ""}` : "Lead"}
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate">Email</p>
                <p className="mt-1">{selectedLead.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate">Phone</p>
                <p className="mt-1">{selectedLead.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate">Interest</p>
                <p className="mt-1 capitalize">{selectedLead.interest || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate">Source</p>
                <p className="mt-1">{selectedLead.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate">Created</p>
                <p className="mt-1">{new Date(selectedLead.created_at).toLocaleString()}</p>
              </div>
            </div>

            <Select
              label="Status"
              value={selectedLead.status}
              onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </Select>

            <Textarea
              label="Notes"
              defaultValue={selectedLead.notes || ""}
              onBlur={(e) => updateNotes(selectedLead.id, e.target.value)}
              rows={3}
              placeholder="Add notes about this lead..."
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
