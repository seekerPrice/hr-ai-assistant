import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, address } = body;

    if (!email || !address) {
      return NextResponse.json({ error: "Missing email or address" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: "ok", source: "fallback" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase
      .from("profiles")
      .update({
        address_line1: address.line1,
        address_line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      console.error("Update address error:", error);
      return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }

    return NextResponse.json({ status: "updated" });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
