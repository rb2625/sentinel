"use client";
import { useState } from "react";
import { Section } from "../../components/Section";
import { SeverityBadge } from "../../components/SeverityBadge";

const PRESETS = [
  { label: "Car Accident (Dubai)", phone: "+99999991000", desc: "Car accident on Sheikh Zayed Road near Dubai Mall, two vehicles involved, traffic blocked", lat: 25.1972, lon: 55.2744, loc: "Sheikh Zayed Road, Dubai" },
  { label: "Fire (Jebel Ali)", phone: "+99999991001", desc: "Fire near Jebel Ali port, smoke visible from highway, multiple containers affected", lat: 24.9857, lon: 55.0272, loc: "Jebel Ali Port, Dubai" },
  { label: "Flooding (Abu Dhabi)", phone: "+99999990400", desc: "Flooding on Corniche Road after heavy rain, water level rising, cars stranded", lat: 24.4539, lon: 54.3773, loc: "Corniche Road, Abu Dhabi" },
  { label: "Arabic Report", phone: "+99999990404", desc: "Hatha hadith siyara fi tariq Sheikh Zayed, siyaratayn talqatan", lat: 25.2048, lon: 55.2708, loc: "Sheikh Zayed Road" },
];

export default function ValidatePage() {
  const [form, setForm] = useState({ phone: "+99999991000", description: "", latitude: "25.1972", longitude: "55.2744", location_name: "", language: "en" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const resp = await fetch("/api/incidents/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_phone: form.phone,
          description: form.description,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          location_name: form.location_name || undefined,
          language: form.language,
          source: "dashboard",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || "Failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (p: typeof PRESETS[0]) => {
    setForm({ phone: p.phone, description: p.desc, latitude: String(p.lat), longitude: String(p.lon), location_name: p.loc, language: "en" });
  };

  return (
    <div className="space-y-8">
      <Section kicker="VALIDATE" title="Submit Incident Report">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => loadPreset(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-zinc-300 hover:text-amber-400">
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Language</label>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="arz">Arabizi</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none resize-none" placeholder="Describe the incident..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Latitude</label>
              <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Longitude</label>
              <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Location Name</label>
              <input value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none" placeholder="e.g. Dubai Mall" />
            </div>
          </div>
          <button onClick={submit} disabled={loading || !form.description} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glow">
            {loading ? "Processing through agent pipeline..." : "Submit and Validate"}
          </button>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
        </div>
      </Section>

      {result && (
        <Section kicker="RESULT" title="Pipeline Output">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 font-mono uppercase">Trust Score</p>
                <p className={`text-3xl font-bold mt-1 ${result.trust_score >= 60 ? "text-emerald-400" : result.trust_score >= 30 ? "text-amber-400" : "text-rose-400"}`}>{result.trust_score}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 font-mono uppercase">Severity</p>
                <div className="mt-2"><SeverityBadge severity={result.classification?.severity || "medium"} /></div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 font-mono uppercase">Type</p>
                <p className="text-sm font-semibold mt-2 text-sand-100 capitalize">{(result.classification?.incident_type || "other").replace(/_/g, " ")}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500 font-mono uppercase">Time</p>
                <p className="text-2xl font-bold mt-1 text-violet-400">{result.processing_time_seconds}s</p>
              </div>
            </div>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-sand-100">Agent Reasoning</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">VALIDATOR</span>
                  <p className="text-sm text-zinc-400">{result.validation?.reasoning || "N/A"}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">CLASSIFIER</span>
                  <p className="text-sm text-zinc-400">{result.classification?.reasoning || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-sand-100">CAMARA Validation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(result.validation?.results || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs font-mono text-zinc-500 uppercase">{key.replace(/_/g, " ")}</p>
                    <p className={`text-sm font-semibold mt-1 ${val.reachable || val.verified ? "text-emerald-400" : val.swapped ? "text-rose-400" : "text-amber-400"}`}>
                      {val.reachable ? "Connected" : val.verified ? "Verified" : val.swapped ? "SIM Swapped" : val.status || "Unknown"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
