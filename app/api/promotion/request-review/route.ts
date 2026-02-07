import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ status: "pending_review", source: "fallback" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("promotion_requests")
      .upsert(
        {
          email,
          status: "pending_review",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      )
      .select("status")
      .single();

    if (error) {
      console.error("Promotion request error:", error);
      return NextResponse.json({ error: "Failed to request review" }, { status: 500 });
    }

    return NextResponse.json({ status: data?.status ?? "pending_review" });
  } catch (error) {
    console.error("Promotion request error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
