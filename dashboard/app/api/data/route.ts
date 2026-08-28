import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() {
  return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
}

export async function GET(request: NextRequest) {
  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "overview";

  try {
    if (view === "overview") {
      const { count: total } = await supabase.from("incidents").select("*", { count: "exact", head: true });
      const { count: validated } = await supabase.from("validations").select("*", { count: "exact", head: true }).eq("overall_score", 1.0);
      const { count: alerts } = await supabase.from("alerts").select("*", { count: "exact", head: true }).eq("acknowledged", false);
      const { data: recent } = await supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(10);
      const { data: typeData } = await supabase.from("incidents").select("incident_type");
      const byType: Record<string, number> = {};
      (typeData || []).forEach((i: any) => { byType[i.incident_type] = (byType[i.incident_type] || 0) + 1; });
      const { data: classData } = await supabase.from("classifications").select("severity");
      const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      (classData || []).forEach((c: any) => { if (bySeverity[c.severity] !== undefined) bySeverity[c.severity]++; });
      return NextResponse.json({
        total_incidents: total || 0, validated: validated || 0, active_alerts: alerts || 0,
        avg_response_time: "< 2s",
        recent_incidents: (recent || []).map((r: any) => ({
          id: r.id, type: r.incident_type, description: r.description,
          location: r.location_name || "Unknown", severity: "medium", time: r.created_at, validated: false,
        })),
        alerts: [], by_severity: bySeverity, by_type: byType,
      });
    }

    if (view === "incidents") {
      const { data: incidents } = await supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(50);
      return NextResponse.json({ incidents: incidents || [] });
    }

    if (view === "alerts") {
      const { data: alertsList } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(50);
      return NextResponse.json({ alerts: alertsList || [] });
    }

    if (view === "analytics") {
      const { count: total } = await supabase.from("incidents").select("*", { count: "exact", head: true });
      const { data: typeData } = await supabase.from("incidents").select("incident_type");
      const { data: classData } = await supabase.from("classifications").select("severity, sector");
      const byType: Record<string, number> = {};
      (typeData || []).forEach((i: any) => { byType[i.incident_type] = (byType[i.incident_type] || 0) + 1; });
      const bySector: Record<string, number> = {};
      (classData || []).forEach((c: any) => { bySector[c.sector || "general"] = (bySector[c.sector || "general"] || 0) + 1; });
      const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      (classData || []).forEach((c: any) => { if (bySeverity[c.severity] !== undefined) bySeverity[c.severity]++; });
      return NextResponse.json({ total, by_type: byType, by_sector: bySector, by_severity: bySeverity });
    }

    if (view === "map") {
      const { data: markers } = await supabase.from("incidents")
        .select("id, incident_type, latitude, longitude, location_name, created_at")
        .order("created_at", { ascending: false }).limit(100);
      return NextResponse.json({ markers: markers || [] });
    }

    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
