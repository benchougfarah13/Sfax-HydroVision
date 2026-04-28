import { useEffect, useRef, useState } from "react";
import FloatingCard from "../components/FloatingCard";
import PageHero from "../components/PageHero";

declare global {
  interface Window {
    L: any;
  }
}

function loadLeafletAssets(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

type LayerKey = "lakes" | "rivers" | "dams" | "boundary" | "hotspotLayer" | "urbanLayer";

const WATER_LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: "lakes", label: "Lakes & Reservoirs", color: "#38bdf8" },
  { key: "rivers", label: "Rivers & Streams", color: "#67e8f9" },
  { key: "dams", label: "Sidi Salah Dam", color: "#fb7185" },
  { key: "boundary", label: "Sfax Boundary", color: "#60a5fa" },
];

const HOTSPOT_LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: "hotspotLayer", label: "Water Stress Hotspots", color: "#7f1d1d" },
  { key: "urbanLayer", label: "Urban Areas", color: "#f59e0b" },
];

const LEGEND_ITEMS = [
  { color: "#7f1d1d", label: "Critical Hotspot", range: "0.83-0.96" },
  { color: "#fb7185", label: "High Stress", range: "0.73-0.83" },
  { color: "#facc15", label: "Moderate Stress", range: "0.50-0.73" },
  { color: "#84cc16", label: "Low-Moderate", range: "0.44-0.50" },
  { color: "#166534", label: "Low Stress", range: "0.41-0.44" },
  { color: "#38bdf8", label: "Lakes & Reservoirs" },
  { color: "#67e8f9", label: "Rivers & Streams" },
  { color: "#f59e0b", label: "Urban Areas" },
];

export default function MapObservatory() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<Record<string, any>>({});
  const basemapLayersRef = useRef<Record<string, any>>({});

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const [layerStatus, setLayerStatus] = useState("Loading...");
  const [basemap, setBasemap] = useState<"osm" | "satellite" | "topo">("osm");
  const [checkedLayers, setCheckedLayers] = useState<Record<LayerKey, boolean>>({
    lakes: false,
    rivers: false,
    dams: false,
    boundary: false,
    hotspotLayer: false,
    urbanLayer: false,
  });

  const loadedRef = useRef(0);
  const totalLayers = 6;

  function getProp(props: any, names: string[]) {
    for (const name of names) {
      if (props[name] != null && props[name] !== "") return props[name];
    }
    return null;
  }

  const getDelegationName = (props: any) =>
    getProp(props, ["Delegation", "NAME_2", "sfax_del_3", "name", "Name"]);
  const getHotspotScore = (props: any) => {
    const value = props.hotspotSco ?? props.hotspot_score ?? props.score;
    return value != null ? parseFloat(value) : 0.5;
  };
  const getExploitation = (props: any) =>
    getProp(props, ["exploitati", "exploitation_", "Exploitation"]);
  const getFamilies = (props: any) =>
    getProp(props, ["Nb_famille", "Nb_famille_beneficiaire", "Familles"]);
  const getUrbanArea = (props: any) => {
    const km2 = getProp(props, ["SUM_area_km2", "area_km2", "SUM_area_k"]);
    if (km2 != null) return parseFloat(km2);
    const m2 = getProp(props, ["area_m2"]);
    return m2 != null ? parseFloat(m2) / 1e6 : null;
  };
  const getWells = (props: any) => getProp(props, ["Nombre_puits", "puits"]);

  function getHotspotColor(score: number) {
    if (score >= 0.77) return "#7f1d1d";
    if (score >= 0.6) return "#fb7185";
    if (score >= 0.48) return "#facc15";
    if (score >= 0.35) return "#84cc16";
    return "#166534";
  }

  function getCategory(score: number) {
    if (score >= 0.77) return "Critical Hotspot";
    if (score >= 0.6) return "High Stress";
    if (score >= 0.48) return "Moderate Stress";
    if (score >= 0.35) return "Low-Moderate";
    return "Low Stress";
  }

  function esriToGeoJSON(data: any) {
    if (data.type === "FeatureCollection") return data;
    if (Array.isArray(data.features)) {
      return {
        type: "FeatureCollection",
        features: data.features.map((feature: any) => {
          let geometry = feature.geometry;
          if (geometry?.paths) geometry = { type: "LineString", coordinates: geometry.paths[0] };
          else if (geometry?.rings) geometry = { type: "Polygon", coordinates: geometry.rings };
          else if (geometry?.x != null) geometry = { type: "Point", coordinates: [geometry.x, geometry.y] };

          return {
            type: "Feature",
            geometry,
            properties: feature.attributes || {},
          };
        }),
      };
    }
    return data;
  }

  useEffect(() => {
    let cancelled = false;

    loadLeafletAssets().then(() => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const L = window.L;
      const map = L.map(mapRef.current).setView([34.74, 10.76], 9);

      const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri" },
      );

      const topoLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenTopoMap",
      });

      basemapLayersRef.current = { osm: osmLayer, satellite: satLayer, topo: topoLayer };
      mapInstanceRef.current = map;
      L.control.scale({ imperial: false, metric: true }).addTo(map);

      const loadGeoJSON = async (filename: string, style: any, layerName: string) => {
        try {
          const response = await fetch(filename);
          if (!response.ok) throw new Error();
          const geoJSON = esriToGeoJSON(await response.json());

          if (layerName === "dam") {
            layersRef.current[layerName] = L.marker([34.88685, 10.6657]).bindPopup(
              "<b>Sidi Salah Dam</b><br>34.88685°N, 10.6657°E",
            );
          } else if (layerName === "hotspot") {
            layersRef.current[layerName] = L.geoJSON(geoJSON, {
              style: (feature: any) => ({
                fillColor: getHotspotColor(getHotspotScore(feature.properties)),
                weight: 1.5,
                opacity: 0.8,
                color: "white",
                fillOpacity: 0.85,
              }),
              onEachFeature: (feature: any, layer: any) => {
                const props = feature.properties;
                const score = getHotspotScore(props);
                const name = getDelegationName(props) || "Delegation";
                const exploitation = getExploitation(props);
                const families = getFamilies(props);
                const urbanArea = getUrbanArea(props);
                const wells = getWells(props);

                let html = `<div style="min-width:260px;font-family:sans-serif;">
                  <h3 style="margin:0 0 6px;color:#1e3c72;border-bottom:2px solid #2a5298;padding-bottom:4px;">${name}</h3>
                  <span style="background:${getHotspotColor(score)};color:white;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:bold;">${getCategory(score)} (${score.toFixed(3)})</span>
                  <table style="width:100%;margin-top:8px;font-size:13px;border-collapse:collapse;">`;

                if (exploitation != null) {
                  html += `<tr><td style="padding:3px;color:#2a5298;font-weight:bold;">Exploitation</td><td><b>${exploitation}%</b></td></tr>`;
                }
                if (families != null) {
                  html += `<tr><td style="padding:3px;color:#2a5298;font-weight:bold;">Families</td><td><b>${Number(families).toLocaleString()}</b></td></tr>`;
                }
                if (urbanArea != null) {
                  html += `<tr><td style="padding:3px;color:#2a5298;font-weight:bold;">Urban Area</td><td><b>${urbanArea.toFixed(2)} km²</b></td></tr>`;
                }
                if (wells != null) {
                  html += `<tr><td style="padding:3px;color:#2a5298;font-weight:bold;">Wells</td><td><b>${wells}</b></td></tr>`;
                }

                html += "</table></div>";
                layer.bindPopup(html);
              },
            });
          } else if (layerName === "urban") {
            layersRef.current[layerName] = L.geoJSON(geoJSON, {
              style: { color: "#f59e0b", weight: 1, fillColor: "#f59e0b", fillOpacity: 0.5 },
              onEachFeature: (feature: any, layer: any) => {
                const props = feature.properties;
                const name = getDelegationName(props);
                const urbanArea = getUrbanArea(props);
                let html = `<div style="min-width:180px;font-family:sans-serif;"><b style="color:#f59e0b;">Urban Area</b><br>`;
                if (name) html += `${name}<br>`;
                if (urbanArea != null) html += `Area: ${urbanArea.toFixed(2)} km²`;
                layer.bindPopup(`${html}</div>`);
              },
            });
          } else {
            layersRef.current[layerName] = L.geoJSON(geoJSON, { style });
          }
        } catch {
          console.warn(`Could not load ${filename}`);
        } finally {
          loadedRef.current += 1;
          setLayerStatus(`${loadedRef.current}/${totalLayers} layers loaded`);
          if (loadedRef.current >= totalLayers) setLoading(false);
        }
      };

      loadGeoJSON("sfax_boundary.geojson", { color: "#60a5fa", weight: 3, fillColor: "#60a5fa", fillOpacity: 0.1, dashArray: "5,5" }, "boundary");
      loadGeoJSON("sfax_lakes.geojson", { color: "#38bdf8", weight: 2, fillColor: "#67e8f9", fillOpacity: 0.6 }, "lakes");
      loadGeoJSON("sfax_rivers.geojson", { color: "#67e8f9", weight: 2, opacity: 0.8 }, "rivers");
      loadGeoJSON("sfax_dam.geojson", {}, "dam");
      loadGeoJSON("sfax_hotspots.geojson", {}, "hotspot");
      loadGeoJSON("urban_by_deleg.geojson", {}, "urban");
      setTimeout(() => setLoading(false), 10000);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = basemapLayersRef.current;
    if (!map || !layers.osm) return;

    (["osm", "satellite", "topo"] as const).forEach((key) => {
      try {
        if (key === basemap) map.addLayer(layers[key]);
        else map.removeLayer(layers[key]);
      } catch {
        return;
      }
    });
  }, [basemap]);

  const handleLayerToggle = (key: LayerKey, checked: boolean) => {
    setCheckedLayers((prev) => ({ ...prev, [key]: checked }));
    const map = mapInstanceRef.current;
    const keyMap: Record<LayerKey, string> = {
      lakes: "lakes",
      rivers: "rivers",
      dams: "dam",
      boundary: "boundary",
      hotspotLayer: "hotspot",
      urbanLayer: "urban",
    };

    const layer = layersRef.current[keyMap[key]];
    if (!map || !layer) return;

    try {
      if (checked) {
        map.addLayer(layer);
        if (key === "hotspotLayer" && layer.getBounds) map.fitBounds(layer.getBounds());
      } else {
        map.removeLayer(layer);
      }
    } catch {
      return;
    }
  };

  const handleFindDam = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setToast(true);
    map.setView([34.88685, 10.6657], 14);

    const layer = layersRef.current.dam;
    if (layer) {
      map.addLayer(layer);
      setCheckedLayers((prev) => ({ ...prev, dams: true }));
    }

    const L = window.L;
    if (L) {
      const highlight = L.circle([34.88685, 10.6657], {
        color: "#fb7185",
        fillColor: "#fb7185",
        fillOpacity: 0.18,
        radius: 800,
      }).addTo(map);

      setTimeout(() => {
        try {
          map.removeLayer(highlight);
        } catch {
          return;
        }
        setToast(false);
      }, 3000);
    }
  };

  const hotspotLegendItems = LEGEND_ITEMS.slice(0, 5);
  const supportLegendItems = LEGEND_ITEMS.slice(5);

  return (
    <div className="space-y-8 p-6">
      <PageHero
        title="Hotspot Identification"
        description="Overlay water infrastructure, urban footprint, and stress hotspots to identify the most vulnerable parts of Sfax Governorate."
        action={
          <button
            onClick={handleFindDam}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            Locate Sidi Salah Dam
          </button>
        }
      />

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-medium text-white backdrop-blur">
          Locating Sidi Salah Dam...
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Sfax Area", value: "7 545 km²" },
          { label: "Population", value: "1 047 468" },
          { label: "Density", value: "138.8 /km²" },
        ].map(({ label, value }) => (
          <FloatingCard key={label} className="overflow-hidden">
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{value}</p>
            </div>
          </FloatingCard>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <FloatingCard>
          <div className="space-y-5 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Map Canvas</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Water Stress Observatory</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {hotspotLegendItems.map(({ color, label, range }) => (
                  <span key={label} className="inline-flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                    {label} {range ? `(${range})` : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-[36rem] overflow-hidden rounded-2xl border border-white/5 bg-black/10">
              {loading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80">
                  <div className="flex items-center gap-3 text-white">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Loading map data...</span>
                  </div>
                </div>
              ) : null}
              <div ref={mapRef} className="h-full w-full" />
            </div>
          </div>
        </FloatingCard>

        <div className="flex flex-col gap-6">
          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Base Layer</h3>
              <div className="space-y-2">
                {(["osm", "satellite", "topo"] as const).map((value) => {
                  const labels = {
                    osm: "OpenStreetMap",
                    satellite: "Satellite",
                    topo: "Topographic",
                  };

                  return (
                    <div
                      key={value}
                      onClick={() => setBasemap(value)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/5"
                    >
                      <div
                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          basemap === value ? "border-emerald-400" : "border-slate-500"
                        }`}
                      >
                        {basemap === value ? <div className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                      </div>
                      <span className={`text-sm ${basemap === value ? "text-emerald-400" : "text-slate-300"}`}>
                        {labels[value]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Water Features</h3>
              <div className="space-y-2">
                {WATER_LAYERS.map(({ key, label, color }) => (
                  <div
                    key={key}
                    onClick={() => handleLayerToggle(key, !checkedLayers[key])}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/5"
                  >
                    <div
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors"
                      style={{ borderColor: color, background: checkedLayers[key] ? color : "transparent" }}
                    >
                      {checkedLayers[key] ? <span className="text-xs leading-none text-white">✓</span> : null}
                    </div>
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hotspot Analysis</h3>
              <div className="space-y-2">
                {HOTSPOT_LAYERS.map(({ key, label, color }) => (
                  <div
                    key={key}
                    onClick={() => handleLayerToggle(key, !checkedLayers[key])}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:bg-white/5"
                  >
                    <div
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors"
                      style={{ borderColor: color, background: checkedLayers[key] ? color : "transparent" }}
                    >
                      {checkedLayers[key] ? <span className="text-xs leading-none text-white">✓</span> : null}
                    </div>
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Legend</h3>
              <div className="space-y-2">
                {supportLegendItems.map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <div className="h-3.5 w-3.5 flex-shrink-0 rounded-sm" style={{ background: color }} />
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Hotspot Index = (Exploitation × 0.5) + (Unconnected Rate × 0.3) + (Urban Index × 0.2) · Dam: 34.88685°N, 10.6657°E
      </p>
    </div>
  );
}
