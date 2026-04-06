import Badge from "@/components/ui/Badge";
import type { Lead } from "@/lib/types";

const statusVariant: Record<string, "default" | "copper" | "success" | "warning" | "danger"> = {
  new: "copper",
  contacted: "default",
  qualified: "warning",
  converted: "success",
  closed: "danger",
};

export default function RecentLeads({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-navy-light/60 p-8 text-center">
        <p className="text-slate-light">No leads yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-navy-light/60">
      <div className="border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold text-warm-white">Recent Leads</h3>
      </div>
      <div className="divide-y divide-white/5">
        {leads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-warm-white">
                {lead.first_name} {lead.last_name}
              </p>
              <p className="text-xs text-slate">{lead.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {lead.interest && (
                <span className="text-xs text-slate-light capitalize">{lead.interest}</span>
              )}
              <Badge variant={statusVariant[lead.status] || "default"}>
                {lead.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
