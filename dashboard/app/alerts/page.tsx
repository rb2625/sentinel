"use client";
import { useEffect, useState } from "react";
import { Section } from "../../components/Section";
import { SeverityBadge } from "../../components/SeverityBadge";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data?view=alerts")
      .then((r) => (r.ok ? r.json() : { alerts: [] }))
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => {})
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
      <Section kicker="ALERTS" title="Active Alerts">
        {alerts.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-zinc-500 text-sm">No active alerts. Alerts are created automatically for high severity incidents.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div key={alert.id} className="glass rounded-xl p-4 border-l-4 border-rose-500/50">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={alert.severity || "medium"} />
                  <span className="text-xs text-zinc-500 font-mono">#{alert.id}</span>
                  <span className="text-xs text-zinc-600">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-zinc-400">{alert.summary}</p>
                <p className="text-xs text-zinc-600 mt-1">Sector: {alert.severity || "general"} - Channel: {alert.dispatch_channel || "dashboard"}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
