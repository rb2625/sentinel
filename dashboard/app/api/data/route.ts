import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() { return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null; }

export async function GET(request: NextRequest) {
  const supabase = getClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "overview";
  try {
    if (view === "overview") {
      const { count: total } = await supabase.from("incidents").select("*", { count: "exact", head: true });
      const { count: validated } = await supabase.from("validations").select("*", { count: "exact", head: true }).eq("overall_score", 1.0);
      const { count: alerts } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("acknowledged", false);
      const { data: recent } = await supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(10);
      const { data: typeData } = await supabase.from("incidents").select("incident_type");
      const byType: Record<string,number> = {};
      (typeData||[]).forEach((i:any) => { byType[i.incident_type] = (byType[i.incident_type]||0) + 1; });
      return NextResponse.json({ total_incidents: total||0, validated: validated||0, active_alerts: alerts||0, avg_response_time: "< 2s",
        recent_incidents: (recent||[]).map((r:any) => ({ id:r.id, type:r.incident_type, description:r.description, location:r.location_name||"Unknown", severity:"medium", time:r.created_at, validated:false })),
        alerts: [], by_severity: { critical:0, high:0, medium:0, low:0 }, by_type: byType });
    }
    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
