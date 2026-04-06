"use client";

import { useState, useMemo } from "react";
import Container from "@/components/layout/Container";
import PropertyCard from "@/components/property/PropertyCard";
import { Select } from "@/components/ui/Input";
import type { Property } from "@/lib/types";

const villages = [
  "Newton Center",
  "West Newton",
  "Waban",
  "Newton Highlands",
  "Chestnut Hill",
  "Newtonville",
];

const propertyTypes = [
  { value: "colonial", label: "Colonial" },
  { value: "cape", label: "Cape" },
  { value: "ranch", label: "Ranch" },
  { value: "split-level", label: "Split-Level" },
  { value: "victorian", label: "Victorian" },
];

const priceRanges = [
  { value: "", label: "Any Price" },
  { value: "0-1300000", label: "Under $1.3M" },
  { value: "1300000-1600000", label: "$1.3M - $1.6M" },
  { value: "1600000-2000000", label: "$1.6M - $2M" },
  { value: "2000000-99999999", label: "$2M+" },
];

const sortOptions = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "beds_desc", label: "Bedrooms: Most" },
  { value: "ready_asc", label: "Available: Soonest" },
];

export default function PropertiesClient({
  properties,
}: {
  properties: Property[];
}) {
  const [village, setVillage] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [sort, setSort] = useState("price_asc");

  const filtered = useMemo(() => {
    let result = [...properties];

    if (village) {
      result = result.filter((p) => p.neighborhood === village);
    }
    if (type) {
      result = result.filter((p) => p.property_type === type);
    }
    if (price) {
      const [min, max] = price.split("-").map(Number);
      result = result.filter((p) => {
        const val = p.finished_price || 0;
        return val >= min && val <= max;
      });
    }
    if (beds) {
      result = result.filter((p) => (p.finished_beds || 0) >= parseInt(beds));
    }

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => (a.finished_price || 0) - (b.finished_price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.finished_price || 0) - (a.finished_price || 0));
        break;
      case "beds_desc":
        result.sort((a, b) => (b.finished_beds || 0) - (a.finished_beds || 0));
        break;
      case "ready_asc":
        result.sort((a, b) =>
          (a.estimated_ready_date || "").localeCompare(b.estimated_ready_date || "")
        );
        break;
    }

    return result;
  }, [properties, village, type, price, beds, sort]);

  const activeFilters = [village, type, price, beds].filter(Boolean).length;

  return (
    <>
      {/* Filter bar */}
      <section className="sticky top-[73px] z-30 border-y border-stone/10 bg-cream/90 backdrop-blur-xl">
        <Container size="xl">
          <div className="flex flex-wrap items-end gap-3 py-4">
            <div className="min-w-[140px]">
              <Select value={village} onChange={(e) => setVillage(e.target.value)}>
                <option value="">All Villages</option>
                {villages.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="min-w-[130px]">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Types</option>
                {propertyTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select value={price} onChange={(e) => setPrice(e.target.value)}>
                {priceRanges.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>
            <div className="min-w-[100px]">
              <Select value={beds} onChange={(e) => setBeds(e.target.value)}>
                <option value="">Beds</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </Select>
            </div>
            <div className="ml-auto min-w-[170px]">
              <Select value={sort} onChange={(e) => setSort(e.target.value)}>
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </Container>
      </section>

      {/* Results */}
      <section className="py-10 pb-24">
        <Container size="xl">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-stone-light">
              {filtered.length} {filtered.length === 1 ? "home" : "homes"}
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setVillage("");
                    setType("");
                    setPrice("");
                    setBeds("");
                  }}
                  className="ml-3 text-copper hover:text-copper-dark"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-stone/10 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-semibold text-navy">No homes match your filters</p>
              <p className="mt-2 text-sm text-stone-light">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setVillage("");
                  setType("");
                  setPrice("");
                  setBeds("");
                }}
                className="mt-4 text-sm font-semibold text-copper hover:text-copper-dark"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
