"use client";
import { useEffect, useState } from "react";
import { useLang } from "../../lib/lang-context";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, tData } = useLang();

  useEffect(() => {
    fetch("/api/data?view=alerts")
      .then((r) => (r.ok ? r.json() : { alerts: [] }))
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("alerts.title")}</h1>
        <p className="text-zinc-500 text-sm mt-1">{t("alerts.subtitle")}</p>
      </div>

      {alerts.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-zinc-400">{t("alerts.all_clear")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="glass rounded-xl p-4 card-hover animate-fade-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      alert.severity === "critical" ? "text-rose-400 bg-rose-400/10" :
                      alert.severity === "high" ? "text-amber-400 bg-amber-400/10" :
                      alert.severity === "medium" ? "text-violet-400 bg-violet-400/10" :
                      "text-emerald-400 bg-emerald-400/10"
                    }`}>
                      {t(`severity.${alert.severity}`) || alert.severity}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      {tData(alert.incident_type || "unknown")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">{alert.message || "Alert"}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-zinc-500">{t("common.sector")}: {tData(alert.sector || "general")}</span>
                    <span className="text-xs text-zinc-500">{t("alerts.dispatch")}: {alert.dispatch_channel || "telegram"}</span>
                  </div>
                </div>
                <span className="text-xs text-zinc-600">{new Date(alert.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
