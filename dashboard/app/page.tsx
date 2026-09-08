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

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );

  // API returns: total_incidents, active_alerts, recent_incidents, by_severity, by_type
  const totalIncidents = data?.total_incidents || 0;
  const activeAlerts = data?.active_alerts || 0;
  const recentIncidents = data?.recent_incidents || [];
  const bySeverity = data?.by_severity || {};
  const byType = data?.by_type || {};

  const kpis = [
    {
      label: t("overview.total_incidents"),
      value: totalIncidents,
      color: "text-white",
      icon: "📊",
    },
    {
      label: t("overview.active_alerts"),
      value: activeAlerts,
      color: "text-amber-400",
      icon: "🚨",
    },
    {
      label: "Sources",
      value: "5",
      color: "text-violet-400",
      icon: "📡",
    },
  ];

  const severityItems = [
    { key: "critical", color: "bg-red-500", count: bySeverity.critical || 0 },
    { key: "high", color: "bg-orange-500", count: bySeverity.high || 0 },
    { key: "medium", color: "bg-yellow-500", count: bySeverity.medium || 0 },
    { key: "low", color: "bg-green-500", count: bySeverity.low || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-up" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-white">{t("overview.title")}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t("header.subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className={`glass rounded-2xl p-5 stagger-${i + 1} animate-fade-up`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{kpi.icon}</span>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>
            <p className={`text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Severity Breakdown */}
      {severityItems.some((s) => s.count > 0) && (
        <div className="glass rounded-2xl p-5 animate-fade-up stagger-1">
          <h3 className="text-sm font-semibold text-white mb-3">
            {t("overview.severity_breakdown")}
          </h3>
          <div className="space-y-2">
            {severityItems.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-20 capitalize">
                  {s.key}
                </span>
                <div className="flex-1 bg-white/5 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${s.color} transition-all duration-500`}
                    style={{
                      width: `${Math.min(100, (s.count / Math.max(totalIncidents, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-500 w-8 text-right">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Feed */}
      <div className="glass rounded-2xl p-5 animate-fade-up stagger-2">
        <h3 className="text-sm font-semibold text-white mb-3">
          {t("overview.recent_feed")}
        </h3>
        {recentIncidents.length === 0 ? (
          <p className="text-zinc-500 text-sm">{t("overview.no_alerts")}</p>
        ) : (
          <div className="space-y-2">
            {recentIncidents.slice(0, 5).map((incident: any, idx: number) => (
              <div
                key={incident.id}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    incident.severity === "critical"
                      ? "bg-red-500"
                      : incident.severity === "high"
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm text-white flex-1">
                  {incident.description?.substring(0, 60) || incident.type}
                  {(incident.description?.length || 0) > 60 ? "..." : ""}
                </span>
                <span className="text-xs text-zinc-500">
                  {incident.location || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incident Types */}
      {Object.keys(byType).length > 0 && (
        <div className="glass rounded-2xl p-5 animate-fade-up stagger-3">
          <h3 className="text-sm font-semibold text-white mb-3">
            {t("overview.incident_types") || "Incident Types"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byType).map(([type, count]) => (
              <span
                key={type}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300"
              >
                {type.replace(/_/g, " ")} ({count as number})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
