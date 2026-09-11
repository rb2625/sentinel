"use client";
import { useEffect, useState } from "react";
import { useLang } from "../lib/lang-context";

export default function OverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, tData } = useLang();

  useEffect(() => {
    fetch("/api/data?view=overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );

  const totalIncidents = data?.total_incidents || 0;
  const activeAlerts = data?.active_alerts || 0;
  const recentIncidents = data?.recent_incidents || [];
  const bySeverity = data?.by_severity || {};
  const byType = data?.by_type || {};
  const avgTrust = data?.avg_trust || 0;

  const kpis = [
    { label: t("overview.total_incidents"), value: totalIncidents, color: "text-white" },
    { label: t("overview.active_alerts"), value: activeAlerts, color: "text-amber-400" },
    { label: t("overview.avg_trust"), value: `${Math.round(avgTrust * 100)}%`, color: "text-emerald-400" },
    { label: t("severity.critical"), value: bySeverity.critical || 0, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white gradient-text">{t("overview.title")}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass rounded-xl p-4 card-hover animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
            <p className="text-xs text-zinc-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-sm font-semibold text-white mb-4">{t("overview.severity_breakdown")}</h3>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(bySeverity).map(([sev, count]: [string, any]) => (
            <div key={sev} className="flex items-center gap-2">
              <span className={`text-xs font-mono ${sev === "critical" ? "text-rose-400" : sev === "high" ? "text-amber-400" : sev === "medium" ? "text-violet-400" : "text-emerald-400"}`}>
                {t(`severity.${sev}`)}: {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "500ms" }}>
        <h3 className="text-sm font-semibold text-white mb-4">{t("overview.incident_types")}</h3>
        <div className="space-y-2">
          {Object.entries(byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-300">{tData(type.replace(/_/g, " "))}</span>
              <span className="text-sm font-mono text-zinc-500">{count as number}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "600ms" }}>
        <h3 className="text-sm font-semibold text-white mb-4">{t("overview.recent_feed")}</h3>
        <div className="space-y-2">
          {recentIncidents.slice(0, 5).map((incident: any, idx: number) => (
            <div key={incident.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                incident.severity === "critical"
                  ? "text-rose-400 bg-rose-400/10"
                  : incident.severity === "high"
                  ? "text-amber-400 bg-amber-400/10"
                  : "text-zinc-400 bg-white/5"
              }`}>
                {t(`severity.${incident.severity}`) || incident.severity}
              </span>
              <span className="text-sm text-zinc-300 truncate flex-1">
                {incident.description?.substring(0, 60) || tData(incident.incident_type)}
                {(incident.description?.length || 0) > 60 ? "..." : ""}
              </span>
              <span className="text-xs text-zinc-500">{incident.location || ""}</span>
            </div>
          ))}
          {recentIncidents.length === 0 && (
            <p className="text-zinc-600 text-sm">{t("overview.no_alerts")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
