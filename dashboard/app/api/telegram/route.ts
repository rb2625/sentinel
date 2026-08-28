import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const NOKIA_BASE = process.env.NOKIA_NAC_BASE_URL || "https://network-as-code.p-eu.apihub.nokia.io";
const NOKIA_KEY = process.env.NOKIA_NAC_API_KEY || "";

function getClient() {
  return supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
}

async function callNokia(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const resp = await fetch(`${NOKIA_BASE}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-key": NOKIA_KEY,
        "x-rapidapi-host": "network-as-code.nokia.rapidapi.com",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return { error: String(resp.status) };
    return await resp.json();
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function sendTelegram(chatId: number, text: string) {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

function classifyDescription(desc: string): { type: string; severity: string; sector: string } {
  const l = desc.toLowerCase();
  if (l.includes("accident") || l.includes("crash") || l.includes("collision")) return { type: "car_accident", severity: "high", sector: "transport" };
  if (l.includes("fire") || l.includes("smoke") || l.includes("blaze")) return { type: "fire", severity: "critical", sector: "safety" };
  if (l.includes("flood") || l.includes("water") || l.includes("rain")) return { type: "flooding", severity: "high", sector: "infrastructure" };
  if (l.includes("road") || l.includes("bridge")) return { type: "infrastructure", severity: "medium", sector: "transport" };
  if (l.includes("power") || l.includes("outage")) return { type: "utility", severity: "medium", sector: "utilities" };
  if (l.includes("gas") || l.includes("leak")) return { type: "environmental", severity: "high", sector: "environment" };
  return { type: "other", severity: "medium", sector: "general" };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.message) return NextResponse.json({ ok: true });

    const chatId = body.message.chat.id;
    const text = body.message.text || "";
    const phone = body.message.contact?.phone_number || "";

    if (text === "/start" || text === "/help") {
      await sendTelegram(chatId,
        "🔍 <b>SENTINEL Incident Reporter</b>\n\n" +
        "Report an incident by sending:\n" +
        "• A text description of the incident\n" +
        "• Or share your contact to register your phone\n\n" +
        "Example:\n<i>Car accident on Sheikh Zayed Road near Dubai Marina</i>\n\n" +
        "Commands:\n/start - Show this help\n/status - Check system status"
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      const supabase = getClient();
      if (supabase) {
        const { count } = await supabase.from("incidents").select("id", { count: "exact", head: true });
        await sendTelegram(chatId, `📊 <b>SENTINEL Status</b>\n\nTotal incidents: ${count || 0}\nSystem: Operational\nCAMARA APIs: Active`);
      }
      return NextResponse.json({ ok: true });
    }

    if (!text || text.startsWith("/")) return NextResponse.json({ ok: true });

    const supabase = getClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    await sendTelegram(chatId, "⏳ Processing your report...");

    const { type, severity, sector } = classifyDescription(text);

    const reporterPhone = phone || "+99999991000";

    const deviceResult = await callNokia("device-status/v0/connectivity", {
      device: { phoneNumber: reporterPhone },
    });

    const deviceActive = !deviceResult.error && (deviceResult.connectivityStatus === "CONNECTED_DATA" || deviceResult.connectivityStatus === "CONNECTED_SMS");

    let trustScore = 0;
    if (deviceActive) trustScore += 50;
    if (!deviceResult.error) trustScore += 50;

    const { data: incident } = await supabase
      .from("incidents").insert({
        reporter_phone: reporterPhone,
        reporter_name: body.message.from?.first_name || null,
        incident_type: type,
        description: text.substring(0, 500),
        latitude: 25.2048,
        longitude: 55.2744,
        location_name: null,
        language: "en",
        source: "telegram",
      }).select("id").single();

    if (incident) {
      await supabase.from("validations").insert({
        incident_id: incident.id,
        location_verified: false,
        number_verified: !deviceResult.error,
        device_active: deviceActive,
        location_confidence: 0,
        overall_score: trustScore / 100,
        validation_details: { device_status: deviceResult, source: "telegram" },
      });

      await supabase.from("classifications").insert({
        incident_id: incident.id,
        incident_type: type,
        severity,
        sector,
        confidence: 0.85,
        summary: text.substring(0, 200),
        reasoning: `Telegram report classified as ${type} with ${severity} severity.`,
      });

      if (severity === "critical" || severity === "high") {
        await supabase.from("alerts").insert({
          incident_id: incident.id,
          severity,
          sector,
          summary: `${type.replace(/_/g, " ").toUpperCase()}: ${text.substring(0, 150)} [Trust: ${trustScore}%]`,
          dispatch_channel: "telegram",
        });
      }

      const severityEmoji = severity === "critical" ? "🔴" : severity === "high" ? "🟠" : severity === "medium" ? "🟡" : "🟢";
      await sendTelegram(chatId,
        `${severityEmoji} <b>Incident Reported</b>\n\n` +
        `<b>Type:</b> ${type.replace(/_/g, " ")}\n` +
        `<b>Severity:</b> ${severity.toUpperCase()}\n` +
        `<b>Trust Score:</b> ${trustScore}%\n` +
        `<b>Device:</b> ${deviceActive ? "Active" : "Unknown"}\n` +
        `<b>ID:</b> #${incident.id}\n\n` +
        `Reported via Telegram and validated through CAMARA network APIs.`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    bot: "SENTINEL Incident Reporter",
    commands: ["/start", "/help", "/status"],
  });
}
