import { useEffect, useRef, useState } from "react";
import { Layers3, LocateFixed, Radar, ShieldAlert } from "lucide-react";
import { fromArrayBuffer } from "geotiff";
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

interface VulnerabilityClass {
  class: number;
  name: string;
  area_km2: number;
  percentage: number;
  color: string;
}

interface DrasticStats {
  raster: string;
  pixel_size_m: number;
  classes: VulnerabilityClass[];
}

const DRASTIC_DATA: DrasticStats = {
  raster: "reclass_indx1.tif",
  pixel_size_m: 100,
  classes: [
    { class: 1, name: "Very Low", area_km2: 1.18, percentage: 0.0, color: "#38bdf8" },
    { class: 2, name: "Low", area_km2: 4306.84, percentage: 48.8, color: "#5eead4" },
    { class: 3, name: "Moderate", area_km2: 4250.49, percentage: 48.2, color: "#f59e0b" },
    { class: 4, name: "High", area_km2: 260.41, percentage: 3.0, color: "#f43f5e" },
  ],
};

const LEGEND_ITEMS = DRASTIC_DATA.classes.map((item) => ({
  color: item.color,
  label: item.name,
  classLabel: `Class ${item.class}`,
}));

const FALLBACK_BOUNDS: [[number, number], [number, number]] = [
  [34.0, 10.0],
  [35.5, 11.5],
];

function SummaryCard({
  label,
  value,
  detail,
  color,
  accent,
  Icon,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
  accent: string;
  Icon: typeof Radar;
}) {
  return (
    <FloatingCard className="overflow-hidden">
      <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: accent }}>
            <Icon size={18} color={color} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        </div>
        <p className="text-4xl font-bold" style={{ color }}>
          {value}
        </p>
        <p className="mt-3 text-sm text-slate-300">{detail}</p>
      </div>
    </FloatingCard>
  );
}

function ControlPill({
  active,
  label,
  onClick,
  activeClassName,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  activeClassName: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? activeClassName
          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

export default function DrasticMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drasticOverlayRef = useRef<any>(null);
  const basemapLayersRef = useRef<Record<string, any>>({});

  const [loading, setLoading] = useState(true);
  const [basemap, setBasemap] = useState<"osm" | "satellite" | "topo">("osm");
  const [showDrasticOverlay, setShowDrasticOverlay] = useState(true);
  const [layerStatus, setLayerStatus] = useState("Initializing map...");

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      await loadLeafletAssets();
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

      setLayerStatus("Loading DRASTIC overlay...");

      try {
        const response = await fetch("/DRASTIC_Map.tif");
        if (!response.ok) throw new Error(`Failed to fetch TIFF: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const data = (await image.readRasters()) as any;
        const width = image.getWidth();
        const height = image.getHeight();

        let drasticBounds = FALLBACK_BOUNDS;
        const bbox = image.getBoundingBox?.();
        if (Array.isArray(bbox) && bbox.length === 4) {
          const [minX, minY, maxX, maxY] = bbox;
          const looksLikeLonLat =
            Number.isFinite(minX) &&
            Number.isFinite(minY) &&
            Number.isFinite(maxX) &&
            Number.isFinite(maxY) &&
            minX >= -180 &&
            maxX <= 180 &&
            minY >= -90 &&
            maxY <= 90 &&
            minX < maxX &&
            minY < maxY;

          if (looksLikeLonLat) {
            drasticBounds = [[minY, minX], [maxY, maxX]];
          }
        }

        if (!data[0]) throw new Error("No raster data found");

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        const imageData = ctx.createImageData(width, height);
        const rasterData = data[0];

        const validValues: number[] = [];
        for (let index = 0; index < rasterData.length; index += 1) {
          const value = Number(rasterData[index]);
          if (Number.isFinite(value) && value > 0) validValues.push(value);
        }
        validValues.sort((a, b) => a - b);

        const q1 = validValues.length ? validValues[Math.floor(validValues.length * 0.25)] : 1;
        const q2 = validValues.length ? validValues[Math.floor(validValues.length * 0.5)] : 2;
        const q3 = validValues.length ? validValues[Math.floor(validValues.length * 0.75)] : 3;

        for (let index = 0; index < rasterData.length; index += 1) {
          const value = Number(rasterData[index]);
          let color: [number, number, number, number] = [200, 200, 200, 0];

          if (Number.isFinite(value) && value > 0) {
            if (value <= 4 && Number.isInteger(value)) {
              if (value === 1) color = [56, 189, 248, 255];
              else if (value === 2) color = [94, 234, 212, 255];
              else if (value === 3) color = [245, 158, 11, 255];
              else color = [244, 63, 94, 255];
            } else {
              if (value <= q1) color = [56, 189, 248, 255];
              else if (value <= q2) color = [94, 234, 212, 255];
              else if (value <= q3) color = [245, 158, 11, 255];
              else color = [244, 63, 94, 255];
            }
          }

          imageData.data[index * 4] = color[0];
          imageData.data[index * 4 + 1] = color[1];
          imageData.data[index * 4 + 2] = color[2];
          imageData.data[index * 4 + 3] = color[3];
        }

        ctx.putImageData(imageData, 0, 0);
        const rasterUrl = canvas.toDataURL("image/png");
        const overlay = L.imageOverlay(rasterUrl, drasticBounds, { opacity: 0.76, interactive: true });

        overlay.addTo(map);
        drasticOverlayRef.current = overlay;
        setLayerStatus("DRASTIC vulnerability layer loaded");
        setLoading(false);
        map.fitBounds(drasticBounds);
      } catch (error) {
        setLayerStatus(error instanceof Error ? error.message : "Error loading DRASTIC map");
        setLoading(false);
      }
    };

    initializeMap();

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

  useEffect(() => {
    const overlay = drasticOverlayRef.current;
    const map = mapInstanceRef.current;
    if (!overlay || !map) return;

    try {
      if (showDrasticOverlay) map.addLayer(overlay);
      else map.removeLayer(overlay);
    } catch {
      return;
    }
  }, [showDrasticOverlay]);

  const handleZoomToExtent = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.fitBounds(FALLBACK_BOUNDS);
  };

  const dominantClass = [...DRASTIC_DATA.classes].sort((a, b) => b.percentage - a.percentage)[0];
  const highRiskClass = DRASTIC_DATA.classes.find((item) => item.name === "High") ?? DRASTIC_DATA.classes[3];
  const mappedArea = DRASTIC_DATA.classes.reduce((sum, item) => sum + item.area_km2, 0);

  return (
    <div className="space-y-8 p-6">
      <PageHero
        title="DRASTIC Vulnerability"
        action={
          <button
            onClick={handleZoomToExtent}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <LocateFixed size={16} />
            Zoom to Extent
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <SummaryCard
          label="Pixel Resolution"
          value={`${DRASTIC_DATA.pixel_size_m} m`}
          detail="Raster cell size used for the vulnerability surface"
          color="#38bdf8"
          accent="rgba(56,189,248,0.18)"
          Icon={Layers3}
        />
        <SummaryCard
          label="Mapped Area"
          value={`${mappedArea.toLocaleString(undefined, { maximumFractionDigits: 0 })} km²`}
          detail="Total area summarized from the class coverage table"
          color="#5eead4"
          accent="rgba(94,234,212,0.18)"
          Icon={Radar}
        />
        <SummaryCard
          label="Dominant Class"
          value={dominantClass.name}
          detail={`${dominantClass.percentage}% of the mapped area`}
          color="#f59e0b"
          accent="rgba(245,158,11,0.18)"
          Icon={ShieldAlert}
        />
        <SummaryCard
          label="High Vulnerability"
          value={`${highRiskClass.percentage}%`}
          detail={`${highRiskClass.area_km2.toLocaleString()} km² classified as high risk`}
          color="#f43f5e"
          accent="rgba(244,63,94,0.18)"
          Icon={ShieldAlert}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <FloatingCard>
          <div className="space-y-5 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Basemap</span>
                <ControlPill
                  active={basemap === "osm"}
                  label="OpenStreetMap"
                  onClick={() => setBasemap("osm")}
                  activeClassName="border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                />
                <ControlPill
                  active={basemap === "satellite"}
                  label="Satellite"
                  onClick={() => setBasemap("satellite")}
                  activeClassName="border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                />
                <ControlPill
                  active={basemap === "topo"}
                  label="Topographic"
                  onClick={() => setBasemap("topo")}
                  activeClassName="border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overlay</span>
                <ControlPill
                  active={showDrasticOverlay}
                  label="DRASTIC Layer"
                  onClick={() => setShowDrasticOverlay((value) => !value)}
                  activeClassName="border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/10 p-3">
              <div className="mb-4 flex flex-wrap items-center gap-4 px-2 pt-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Map Canvas</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Groundwater Vulnerability Surface</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {LEGEND_ITEMS.map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative h-[34rem] overflow-hidden rounded-2xl border border-white/5">
                {loading ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80">
                    <div className="flex items-center gap-3 text-white">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Loading DRASTIC map...</span>
                    </div>
                  </div>
                ) : null}
                <div ref={mapRef} className="h-full w-full" />
              </div>
            </div>
          </div>
        </FloatingCard>

        <div className="flex flex-col gap-6">
          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Area Coverage</p>
              <div className="mt-5 space-y-4">
                {DRASTIC_DATA.classes.map((item) => (
                  <div key={item.class}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-white">{item.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.area_km2.toLocaleString()} km²</p>
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">DRASTIC Factors</p>
              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-300">
                {[
                  "Depth to water table",
                  "Net recharge",
                  "Aquifer media",
                  "Soil media",
                  "Topography",
                  "Impact of vadose zone",
                  "Hydraulic conductivity",
                ].map((factor) => (
                  <div key={factor} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

    </div>
  );
}
