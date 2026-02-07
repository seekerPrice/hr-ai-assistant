import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      leaveBalance: 12,
      source: "fallback",
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("profiles")
    .select("leave_balance")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Leave balance error:", error);
    return NextResponse.json({ leaveBalance: 12, source: "fallback" });
  }

  return NextResponse.json({
    leaveBalance: data?.leave_balance ?? 12,
    source: data ? "supabase" : "fallback",
  });
}
