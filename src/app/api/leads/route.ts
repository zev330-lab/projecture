import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, email, last_name, phone, interest, notes, source } = body;

    if (!first_name || !email) {
      return NextResponse.json(
        { error: "First name and email are required" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Fallback: submit to Formspree if Supabase not configured
      const formData = new FormData();
      formData.append("name", first_name);
      formData.append("email", email);
      if (interest) formData.append("interest", interest);

      await fetch("https://formspree.io/f/xvzbbrpb", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      return NextResponse.json({ success: true, fallback: "formspree" });
    }

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name,
        last_name: last_name || null,
        email,
        phone: phone || null,
        interest: interest || null,
        notes: notes || null,
        source: source || "website",
      })
      .select()
      .single();

    if (error) {
      console.error("Lead insert error:", error);
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
