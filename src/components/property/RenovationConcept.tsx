"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import type { RenovationConcept as RenovationConceptType, CostItem } from "@/lib/types";

function formatCurrency(amount: number | null): string {
  if (!amount) return "TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Props {
  concept: RenovationConceptType & { cost_items: CostItem[] };
}

export default function RenovationConcept({ concept }: Props) {
  const [costOpen, setCostOpen] = useState(false);

  const categories = concept.cost_items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, CostItem[]>
  );

  return (
    <div className="rounded-xl border border-stone/10 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-navy">{concept.title}</h3>
            {concept.description && (
              <p className="mt-2 text-sm text-stone-light leading-relaxed">{concept.description}</p>
            )}
          </div>
        </div>

        {/* Scope badges */}
        {concept.scope && concept.scope.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {concept.scope.map((s) => (
              <Badge key={s} variant="default">
                {s.replace("_", " ")}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-px border-t border-stone/10 bg-stone/5 md:grid-cols-4">
        <div className="bg-cream-dark p-4 text-center">
          <p className="text-xs text-stone-lighter">Estimated Cost</p>
          <p className="mt-1 text-sm font-bold text-copper">
            {formatCurrency(concept.estimated_cost_low)} &ndash; {formatCurrency(concept.estimated_cost_high)}
          </p>
        </div>
        <div className="bg-cream-dark p-4 text-center">
          <p className="text-xs text-stone-lighter">Timeline</p>
          <p className="mt-1 text-sm font-bold text-navy">
            {concept.estimated_timeline_weeks ? `${concept.estimated_timeline_weeks} weeks` : "TBD"}
          </p>
        </div>
        <div className="bg-cream-dark p-4 text-center">
          <p className="text-xs text-stone-lighter">After-Renovation Value</p>
          <p className="mt-1 text-sm font-bold text-navy">{formatCurrency(concept.estimated_arv)}</p>
        </div>
        <div className="bg-cream-dark p-4 text-center">
          <p className="text-xs text-stone-lighter">ROI</p>
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {concept.roi_percentage ? `${concept.roi_percentage}%` : "TBD"}
          </p>
        </div>
      </div>

      {/* Cost breakdown accordion */}
      {concept.cost_items.length > 0 && (
        <div className="border-t border-stone/10">
          <button
            onClick={() => setCostOpen(!costOpen)}
            className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-stone-light transition-colors hover:text-navy"
          >
            <span>Cost Breakdown ({concept.cost_items.length} items)</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform ${costOpen ? "rotate-180" : ""}`}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {costOpen && (
            <div className="border-t border-stone/10 px-6 pb-6">
              {Object.entries(categories).map(([category, items]) => (
                <div key={category} className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-copper">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-stone">{item.item_name}</span>
                          <Badge variant="default">{item.item_type}</Badge>
                        </div>
                        <span className="text-navy font-medium">
                          {formatCurrency(item.cost_low)} &ndash; {formatCurrency(item.cost_high)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
