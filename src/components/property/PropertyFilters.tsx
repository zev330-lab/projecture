"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";
import Input from "@/components/ui/Input";

const towns = ["Newton", "Brookline", "Wellesley", "Lexington", "Cambridge", "Weston"];
const propertyTypes = ["Colonial", "Cape", "Ranch", "Victorian", "Split-Level", "Contemporary"];

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-navy-light/40 p-5">
      <h3 className="text-sm font-semibold text-warm-white">Filters</h3>

      <Select
        label="Town"
        value={searchParams.get("city") || ""}
        onChange={(e) => updateFilter("city", e.target.value)}
      >
        <option value="">All Towns</option>
        {towns.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>

      <Select
        label="Property Type"
        value={searchParams.get("type") || ""}
        onChange={(e) => updateFilter("type", e.target.value)}
      >
        <option value="">All Types</option>
        {propertyTypes.map((t) => (
          <option key={t} value={t.toLowerCase()}>{t}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min Price"
          type="number"
          placeholder="$0"
          value={searchParams.get("price_min") || ""}
          onChange={(e) => updateFilter("price_min", e.target.value)}
        />
        <Input
          label="Max Price"
          type="number"
          placeholder="No max"
          value={searchParams.get("price_max") || ""}
          onChange={(e) => updateFilter("price_max", e.target.value)}
        />
      </div>

      <Select
        label="Bedrooms"
        value={searchParams.get("beds") || ""}
        onChange={(e) => updateFilter("beds", e.target.value)}
      >
        <option value="">Any</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
        <option value="5">5+</option>
      </Select>

      <Select
        label="Sort By"
        value={searchParams.get("sort") || ""}
        onChange={(e) => updateFilter("sort", e.target.value)}
      >
        <option value="">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="reno_score">Renovation Score</option>
      </Select>
    </div>
  );
}
