"use client";
import { useEffect, useState } from "react";
import { Section } from "../../components/Section";
import { SeverityBadge } from "../../components/SeverityBadge";
import { useLang } from "../../lib/lang-context";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/data?view=incidents")
      .then((r) => (r.ok ? r.json() : { incidents: [] }))
      .then((d) => setIncidents(d.incidents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-8">
      <Section kicker="INCIDENTS" title={t("incidents.title")}>
        {incidents.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-zinc-500 text-sm">
              {t("incidents.no_incidents")}. {t("incidents.submit_first")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc: any) => (
              <div
                key={inc.id}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-sand-100 capitalize">
                      {(inc.incident_type || "other").replace(/_/g, " ")}
                    </span>
                    <SeverityBadge severity="medium" />
                    <span className="text-xs text-zinc-500 font-mono">
                      #{inc.id}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-1">
                    {inc.description}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {inc.location_name || t("common.location")} &middot;{" "}
                    {new Date(inc.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-zinc-500">
                    {inc.language?.toUpperCase() || "EN"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
