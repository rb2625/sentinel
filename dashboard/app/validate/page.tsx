"use client";
import { useState } from "react";
import { useLang } from "../../lib/lang-context";
import { Section } from "../../components/Section";
import { SeverityBadge } from "../../components/SeverityBadge";

const PRESETS = [
  { label: "Car Accident (Dubai)", phone: "+99999991000", desc: "Car accident on Sheikh Zayed Road near Dubai Mall, two vehicles involved, traffic blocked", lat: 25.1972, lon: 55.2744, loc: "Sheikh Zayed Road, Dubai" },
  { label: "Fire (Jebel Ali)", phone: "+99999991001", desc: "Fire near Jebel Ali port, smoke visible from highway, multiple containers affected", lat: 24.9857, lon: 55.0272, loc: "Jebel Ali Port, Dubai" },
  { label: "Flooding (Abu Dhabi)", phone: "+99999990400", desc: "Flooding on Corniche Road after heavy rain, water level rising, cars stranded", lat: 24.4539, lon: 54.3773, loc: "Corniche Road, Abu Dhabi" },
  { label: "Arabic Report", phone: "+99999990404", desc: "Hatha hadith siyara fi tariq Sheikh Zayed, siyaratayn talqatan", lat: 25.2048, lon: 55.2708, loc: "Sheikh Zayed Road" },
];

export default function ValidatePage() {
  const { t } = useLang();
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
    <div className="space-y-8 animate-fade-up">
      <Section kicker="VALIDATE" title={t("validate.title")}>
        <div className="glass rounded-2xl p-6 space-y-4">
          <p className="text-sm text-zinc-400">{t("validate.subtitle")}</p>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-zinc-300 hover:text-amber-400 card-hover"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.phone")}</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.language")}</label>
              <select
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="arz">Arabizi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.description")}</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none resize-none"
              placeholder={t("validate.description_placeholder")}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.lat")}</label>
              <input
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.lon")}</label>
              <input
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{t("validate.location")}</label>
              <input
                value={form.location_name}
                onChange={e => setForm({ ...form, location_name: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-sand-100 focus:border-amber-500/50 outline-none"
                placeholder="e.g. Dubai Mall"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={loading || !form.description}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glow btn-glow"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t("validate.processing")}
              </span>
            ) : (
              t("validate.submit")
            )}
          </button>

          {error && (
            <p className="text-rose-400 text-sm animate-fade-in">{error}</p>
          )}
        </div>
      </Section>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-scale-in">
          <Section kicker="RESULT" title="Pipeline Output">
            {/* Trust Score Card */}
            <div className="glass rounded-2xl p-6 text-center mb-4">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2">{t("validate.trust_score")}</p>
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                result.trust_score >= 70 ? "bg-emerald-500/20 trust-score" :
                result.trust_score >= 40 ? "bg-amber-500/20" :
                "bg-rose-500/20"
              }`}>
                <span className={`text-4xl font-bold ${
                  result.trust_score >= 70 ? "text-emerald-400" :
                  result.trust_score >= 40 ? "text-amber-400" :
                  "text-rose-400"
                }`}>{result.trust_score}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-xl p-4 text-center card-hover">
                <p className="text-xs text-zinc-500 font-mono uppercase">Severity</p>
                <div className="mt-2"><SeverityBadge severity={result.classification?.severity || "medium"} /></div>
              </div>
              <div className="glass rounded-xl p-4 text-center card-hover">
                <p className="text-xs text-zinc-500 font-mono uppercase">Type</p>
                <p className="text-sm font-semibold mt-2 text-sand-100 capitalize">{(result.classification?.incident_type || "other").replace(/_/g, " ")}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center card-hover">
                <p className="text-xs text-zinc-500 font-mono uppercase">Time</p>
                <p className="text-2xl font-bold mt-1 text-violet-400">{result.processing_time_seconds}s</p>
              </div>
              <div className="glass rounded-xl p-4 text-center card-hover">
                <p className="text-xs text-zinc-500 font-mono uppercase">Status</p>
                <p className="text-sm font-semibold mt-1 text-emerald-400">Validated</p>
              </div>
            </div>

            {/* Agent Reasoning */}
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-sand-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                {t("validate.agent_reasoning")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded shrink-0">VALIDATOR</span>
                  <p className="text-sm text-zinc-400">{result.validation?.reasoning || "N/A"}</p>
                </div>
                <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded shrink-0">CLASSIFIER</span>
                  <p className="text-sm text-zinc-400">{result.classification?.reasoning || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* CAMARA Validation Results */}
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-sand-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                CAMARA Validation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(result.validation?.results || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-4 card-hover">
                    <p className="text-xs font-mono text-zinc-500 uppercase mb-2">{key.replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        val.reachable || val.verified ? "bg-emerald-400" :
                        val.swapped ? "bg-rose-400" :
                        "bg-amber-400"
                      }`}></span>
                      <p className={`text-sm font-semibold ${
                        val.reachable || val.verified ? "text-emerald-400" :
                        val.swapped ? "text-rose-400" :
                        "text-amber-400"
                      }`}>
                        {val.reachable ? "Connected" : val.verified ? "Verified" : val.swapped ? "SIM Swapped" : val.status || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
