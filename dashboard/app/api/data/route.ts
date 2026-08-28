import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getClient() {
  return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = getClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "overview";

  try {
    if (view === "overview") {
      const [incCount, valCount, alertCount, recent, classData] = await Promise.all([
        supabase.from("incidents").select("*", { count: "exact", head: true }),
        supabase.from("validations").select("*", { count: "exact", head: true }).eq("overall_score", 1.0),
        supabase.from("alerts").select("*", { count: "exact", head: true }).eq("acknowledged", false),
        supabase.from("incidents").select("id, incident_type, description, location_name, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("classifications").select("severity, incident_type"),
      ]);

      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      (classData.data || []).forEach((c: any) => {
        byType[c.incident_type] = (byType[c.incident_type] || 0) + 1;
        if (bySeverity[c.severity] !== undefined) bySeverity[c.severity]++;
      });

      return NextResponse.json({
        total_incidents: incCount.count || 0,
        validated: valCount.count || 0,
        active_alerts: alertCount.count || 0,
        avg_response_time: "< 2s",
        recent_incidents: (recent.data || []).map((r: any) => ({
          id: r.id, type: r.incident_type, description: r.description,
          location: r.location_name || "Unknown", severity: "medium", time: r.created_at,
        })),
        by_severity: bySeverity, by_type: byType,
      });
    }

    if (view === "incidents") {
      const { data } = await supabase.from("incidents").select("id, incident_type, description, location_name, created_at").order("created_at", { ascending: false }).limit(50);
      return NextResponse.json({ incidents: data || [] });
    }

    if (view === "alerts") {
      const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(50);
      return NextResponse.json({ alerts: data || [] });
    }

    if (view === "analytics") {
      const [incCount, classData] = await Promise.all([
        supabase.from("incidents").select("*", { count: "exact", head: true }),
        supabase.from("classifications").select("severity, sector, incident_type"),
      ]);

      const byType: Record<string, number> = {};
      const bySector: Record<string, number> = {};
      const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
      (classData.data || []).forEach((c: any) => {
        byType[c.incident_type] = (byType[c.incident_type] || 0) + 1;
        bySector[c.sector || "general"] = (bySector[c.sector || "general"] || 0) + 1;
        if (bySeverity[c.severity] !== undefined) bySeverity[c.severity]++;
      });

      return NextResponse.json({ total: incCount.count || 0, by_type: byType, by_sector: bySector, by_severity: bySeverity });
    }

    if (view === "map") {
      const { data } = await supabase.from("incidents")
        .select("id, incident_type, latitude, longitude, location_name, created_at")
        .order("created_at", { ascending: false }).limit(100);
      return NextResponse.json({ markers: data || [] });
    }

    return NextResponse.json({ error: "Unknown view" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
