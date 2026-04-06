"use client";

import { useState, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input, { Select, Textarea } from "@/components/ui/Input";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
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
        body: JSON.stringify({ ...data, source: "contact_page" }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, []);

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <p className="text-xl font-semibold text-emerald-400">Message Sent</p>
        <p className="mt-2 text-slate-light">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="first_name" name="first_name" label="First Name" placeholder="First name" required />
        <Input id="last_name" name="last_name" label="Last Name" placeholder="Last name" />
      </div>

      <Input id="email" name="email" type="email" label="Email" placeholder="you@example.com" required />
      <Input id="phone" name="phone" type="tel" label="Phone" placeholder="(555) 555-5555" />

      <Select id="interest" name="interest" label="I'm interested in" required>
        <option value="">Select one</option>
        <option value="buying">Buying a home with renovation potential</option>
        <option value="selling">Selling my home</option>
        <option value="both">Both buying and selling</option>
        <option value="curious">Just curious about Projecture</option>
      </Select>

      <Textarea
        id="notes"
        name="notes"
        label="Message"
        placeholder="Tell us about what you're looking for..."
        rows={4}
      />

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : status === "error" ? "Try Again" : "Send Message"}
      </Button>
    </form>
  );
}
