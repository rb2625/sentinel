"use client";
import { useEffect, useState, useRef } from "react";
import { useLang } from "../../lib/lang-context";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

interface Marker {
  id: number;
  incident_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: string;
  created_at: string;
}

export default function MapPage() {
  const { t } = useLang();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/data?view=map")
      .then((r) => (r.ok ? r.json() : { markers: [] }))
      .then((d) => setMarkers(d.markers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !mapRef.current || markers.length === 0) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (!document.querySelector("link[href*=leaflet]")) { const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link); }

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
      }).setView([25.2, 55.3], 7);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const group = L.featureGroup();

      markers.forEach((m) => {
        if (!m.latitude || !m.longitude) return;
        const color = SEVERITY_COLORS[m.severity] || "#94a3b8";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 10px ${color}80;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:180px">
            <div style="font-weight:600;text-transform:capitalize;margin-bottom:4px">${(m.incident_type || "unknown").replace(/_/g, " ")}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">${m.location_name || "Unknown location"}</div>
            <div style="font-size:11px;color:${color};font-weight:600;text-transform:uppercase">${m.severity}</div>
            <div style="font-size:10px;color:#999;margin-top:4px">${new Date(m.created_at).toLocaleString()}</div>
          </div>
        `);
        marker.on("click", () => setSelected(m));
        group.addLayer(marker);
      });

      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.2));
      }

      markerGroupRef.current = group;
      mapInstance.current = map;
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [markers, loading]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  const criticalCount = markers.filter((m) => m.severity === "critical").length;
  const highCount = markers.filter((m) => m.severity === "high").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Incident Map</h1>
        <p className="text-zinc-500 text-sm mt-1">Real-time geographic distribution of reported incidents</p>
      </div>

      {markers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{markers.length}</p>
            <p className="text-xs text-zinc-500">Total Mapped</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-xs text-zinc-500">Critical</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{highCount}</p>
            <p className="text-xs text-zinc-500">High Severity</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div ref={mapRef} className="h-[500px] w-full bg-zinc-900" />
      </div>

      {selected && (
        <div className="glass rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-white capitalize">{(selected.incident_type || "other").replace(/_/g, " ")}</h3>
              <p className="text-xs text-zinc-500 mt-1">{selected.location_name || "Unknown"}</p>
              <p className="text-xs text-zinc-600 mt-1">{selected.latitude?.toFixed(4)}, {selected.longitude?.toFixed(4)}</p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: `${SEVERITY_COLORS[selected.severity]}20`, color: SEVERITY_COLORS[selected.severity] }}>
              {selected.severity?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {markers.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
              <div key={sev} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-xs text-zinc-400 capitalize">{sev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {markers.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-zinc-500 text-sm">No incidents with coordinates yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Submit one from the Validate page.</p>
        </div>
      )}
    </div>
  );
}
