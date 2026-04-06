"use client";

import { useState, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input, { Select } from "@/components/ui/Input";

interface LeadCaptureFormProps {
  source?: string;
  propertyId?: string;
  compact?: boolean;
}

export default function LeadCaptureForm({ source = "website", propertyId, compact = false }: LeadCaptureFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("loading");

      const form = e.currentTarget;
      const formData = new FormData(form);
      const data: Record<string, string> = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            source,
            ...(propertyId && { notes: `Interested in property ${propertyId}` }),
          }),
        });

        if (!res.ok) throw new Error("Failed to submit");

        setStatus("success");
        form.reset();
        setTimeout(() => setStatus("idle"), 4000);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    },
    [source, propertyId]
  );

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="font-semibold text-emerald-400">You&apos;re in!</p>
        <p className="mt-1 text-sm text-slate-light">We&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? "" : "text-left"}`}>
      <div className={compact ? "" : "grid gap-4 md:grid-cols-2"}>
        <Input
          id="first_name"
          name="first_name"
          label="First Name"
          placeholder="First name"
          required
        />
        {!compact && (
          <Input
            id="last_name"
            name="last_name"
            label="Last Name"
            placeholder="Last name"
          />
        )}
      </div>

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
      />

      {!compact && (
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone"
          placeholder="(555) 555-5555"
        />
      )}

      <Select id="interest" name="interest" label="I'm interested in" required>
        <option value="">Select one</option>
        <option value="buying">Buying</option>
        <option value="selling">Selling</option>
        <option value="both">Both</option>
        <option value="curious">Just Curious</option>
      </Select>

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Submitting..." : status === "error" ? "Try Again" : "Get Early Access"}
      </Button>
    </form>
  );
}
