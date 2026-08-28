"use client";
import { useEffect, useState } from "react";
import { useLang } from "../lib/lang-context";

export default function OverviewPage() {
  const { t, locale } = useLang();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data?view=overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const stats = data?.stats || {};
  const alerts = data?.recent_incidents || [];
  const kpis = [
    { label: t("overview.total_incidents"), value: stats.total_incidents || 0, color: "text-white" },
    { label: t("overview.active_alerts"), value: stats.active_alerts || 0, color: "text-amber-400" },
    { label: t("overview.avg_trust"), value: `${Math.round((stats.avg_trust || 0) * 100)}%`, color: "text-emerald-400" },
  ];

  const severityData = data?.by_severity || [];

  return (
    <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-white">{t("overview.title")}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t("header.subtitle")}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {severityData.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">{t("overview.severity_breakdown")}</h3>
          <div className="space-y-2">
            {severityData.map((s: any) => (
              <div key={s.severity} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-20 capitalize">{s.severity}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2">
                  <div className={`h-2 rounded-full ${s.severity === "critical" ? "bg-red-500" : s.severity === "high" ? "bg-orange-500" : s.severity === "medium" ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(100, (s.count / (stats.total_incidents || 1)) * 100)}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">{t("overview.recent_feed")}</h3>
        {alerts.length === 0 ? (
          <p className="text-zinc-500 text-sm">{t("overview.no_alerts")}</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <span className={`w-2 h-2 rounded-full ${a.severity === "critical" ? "bg-red-500" : a.severity === "high" ? "bg-orange-500" : "bg-yellow-500"}`} />
                <span className="text-sm text-white flex-1">{a.description?.substring(0, 60) || a.incident_type}</span>
                <span className="text-xs text-zinc-500">{a.location_name || ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
