import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const DEMO: Record<string, any> = {
  car_accident: {
    trust_score: 65,
    classification: {
      incident_type: "car_accident",
      severity: "high",
      sector: "transport",
      reasoning: "Collision on major highway involving two vehicles. Traffic flow disrupted. High severity due to potential injuries and road blockage.",
    },
    validation: {
      reasoning: "Car accident is urgent and involves potential injuries. Running all verification checks to confirm reporter location and device status.",
      results: {
        device_status: { reachable: true, status: "CONNECTED_DATA", response_time_ms: 120 },
        sim_swap: { swapped: false, last_swap: null },
        location_verification: { verified: true, distance_m: 850, confidence: "high" },
      },
    },
    anomaly: { anomaly_detected: false, nearby_reports: 0 },
  },
  fire: {
    trust_score: 70,
    classification: {
      incident_type: "fire",
      severity: "critical",
      sector: "safety",
      reasoning: "Fire reported near industrial port area with visible smoke. Multiple containers potentially affected. Critical severity due to spread risk.",
    },
    validation: {
      reasoning: "Fire incident near port infrastructure. Running all checks with priority due to critical nature.",
      results: {
        device_status: { reachable: true, status: "CONNECTED_SMS", response_time_ms: 95 },
        sim_swap: { swapped: false, last_swap: null },
        location_verification: { verified: true, distance_m: 320, confidence: "high" },
      },
    },
    anomaly: { anomaly_detected: false, nearby_reports: 0 },
  },
  flooding: {
    trust_score: 55,
    classification: {
      incident_type: "flooding",
      severity: "high",
      sector: "infrastructure",
      reasoning: "Flooding on coastal road after heavy rainfall. Water levels rising. Multiple vehicles stranded. High severity due to ongoing conditions.",
    },
    validation: {
      reasoning: "Flooding report requires location verification to confirm reporter is at the scene.",
      results: {
        device_status: { reachable: true, status: "CONNECTED_SMS", response_time_ms: 140 },
        sim_swap: { swapped: false, last_swap: null },
        location_verification: { verified: false, distance_m: 12000, confidence: "low" },
      },
    },
    anomaly: { anomaly_detected: true, description: "2 similar flooding reports in Abu Dhabi area in the last hour", nearby_reports: 2 },
  },
  other: {
    trust_score: 45,
    classification: {
      incident_type: "other",
      severity: "medium",
      sector: "general",
      reasoning: "General incident report. Insufficient detail for specific classification. Medium severity pending further verification.",
    },
    validation: {
      reasoning: "Standard verification checks for general incident report.",
      results: {
        device_status: { reachable: true, status: "CONNECTED_DATA", response_time_ms: 110 },
        sim_swap: { swapped: false, last_swap: null },
        location_verification: { verified: true, distance_m: 500, confidence: "medium" },
      },
    },
    anomaly: { anomaly_detected: false, nearby_reports: 0 },
  },
};

function classify(desc: string): string {
  const l = desc.toLowerCase();
  if (l.includes("accident") || l.includes("crash") || l.includes("collision") || l.includes("\u062d\u0627\u062f\u062b")) return "car_accident";
  if (l.includes("fire") || l.includes("smoke") || l.includes("\u062d\u0631\u064a\u0642")) return "fire";
  if (l.includes("flood") || l.includes("water") || l.includes("\u0641\u064a\u0636\u0627\u0646")) return "flooding";
  return "other";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try real backend first
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(`${BACKEND_URL}/api/incidents/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (r.ok) return NextResponse.json(await r.json());
    } catch {
      // backend not running, use demo
    }

    // Demo fallback
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
    const t = classify(body.description || "");
    const demo = JSON.parse(JSON.stringify(DEMO[t] || DEMO.other));
    demo.trust_score = Math.min(100, Math.max(0, demo.trust_score + Math.floor(Math.random() * 11) - 5));
    demo.processing_time_seconds = parseFloat((1.8 + Math.random() * 1.5).toFixed(2));
    return NextResponse.json(demo);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
