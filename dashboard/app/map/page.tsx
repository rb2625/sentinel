"use client";
import { useEffect, useState } from "react";

export default function MapPage() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data?view=map")
      .then((r) => (r.ok ? r.json() : { markers: [] }))
      .then((d) => setMarkers(d.markers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4"><div className="skeleton h-96 rounded-2xl" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Incident Map</h1>
        <p className="text-zinc-500 text-sm mt-1">Geographic distribution of reported incidents</p>
      </div>
      {markers.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-zinc-500 text-sm">No incidents with coordinates yet. Submit one from the Validate page.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="relative h-96 bg-zinc-900/50 flex items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-px opacity-10">
              {[...Array(24)].map((_, i) => <div key={i} className="border border-zinc-700" />)}
            </div>
            <div className="relative z-10 text-center">
              <p className="text-6xl mb-4">&#x1F5FA;&#xFE0F;</p>
              <p className="text-zinc-400 text-sm font-medium">{markers.length} incidents mapped</p>
              <p className="text-zinc-600 text-xs mt-1">Interactive map requires Leaflet integration</p>
            </div>
            {markers.slice(0, 10).map((m: any, i: number) => (
              <div key={m.id || i} className="absolute w-3 h-3 rounded-full bg-rose-500 animate-pulse border border-white/30"
                style={{ left: `${Math.min(90, Math.max(10, ((m.longitude - 54) / 4) * 100))}%`, top: `${Math.min(90, Math.max(10, (1 - (m.latitude - 24) / 2) * 100))}%` }}
                title={`${m.location_name || "Unknown"} - ${m.incident_type}`} />
            ))}
          </div>
        </div>
      )}
      {markers.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Locations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {markers.slice(0, 9).map((m: any) => (
              <div key={m.id} className="bg-white/5 rounded-lg p-3">
                <p className="text-sm font-medium text-white capitalize">{(m.incident_type || "other").replace(/_/g, " ")}</p>
                <p className="text-xs text-zinc-500 mt-1">{m.location_name || "Unknown"} - {m.latitude?.toFixed(4)}, {m.longitude?.toFixed(4)}</p>
                <p className="text-xs text-zinc-600 mt-1">{new Date(m.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
