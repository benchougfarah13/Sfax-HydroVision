import { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Download,
  Leaf,
  Layers3,
  Map as MapIcon,
  Waves,
} from 'lucide-react';
import { fromArrayBuffer } from 'geotiff';
import FloatingCard from '../components/FloatingCard';
import PageHero from '../components/PageHero';

declare global {
  interface Window {
    L: any;
  }
}

function loadLeafletAssets(): Promise<void> {
  return new Promise((resolve) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (window.L) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

const ndviClasses = [
  { label: 'Non-Vegetated', min: -0.245557457, max: 0.01232927, color: [166, 73, 0] as const },
  { label: 'Stressed Vegetation', min: 0.01232927, max: 0.082883186, color: [255, 29, 29] as const },
  { label: 'Low to Moderate Vegetation', min: 0.082883186, max: 0.104779229, color: [255, 179, 0] as const },
  { label: 'Moderate Vegetation', min: 0.104779229, max: 0.133973953, color: [143, 236, 0] as const },
  { label: 'Good Vegetation', min: 0.133973953, max: 0.374830425, color: [112, 170, 0] as const },
] as const;

const ndviAnnual = [
  { year: '2015', avg: 0.085, min: -0.076, max: 0.126 },
  { year: '2016', avg: 0.083, min: -0.093, max: 0.149 },
  { year: '2017', avg: 0.091, min: -0.072, max: 0.14 },
  { year: '2018', avg: 0.085, min: 0.01, max: 0.13 },
  { year: '2019', avg: 0.092, min: -0.015, max: 0.131 },
  { year: '2020', avg: 0.096, min: -0.008, max: 0.16 },
  { year: '2021', avg: 0.093, min: 0.039, max: 0.124 },
  { year: '2022', avg: 0.092, min: 0.029, max: 0.113 },
  { year: '2023', avg: 0.094, min: 0.026, max: 0.121 },
  { year: '2024', avg: 0.102, min: -0.004, max: 0.153 },
  { year: '2025', avg: 0.112, min: 0.048, max: 0.162 },
  { year: '2026', avg: 0.105, min: 0.036, max: 0.13 },
];

const ndviRecent = [
  { date: '2024-01', ndvi: 0.102 },
  { date: '2024-02', ndvi: 0.102 },
  { date: '2024-03', ndvi: 0.098 },
  { date: '2024-04', ndvi: 0.081 },
  { date: '2024-05', ndvi: 0.095 },
  { date: '2024-06', ndvi: 0.088 },
  { date: '2024-07', ndvi: 0.094 },
  { date: '2024-08', ndvi: 0.089 },
  { date: '2024-09', ndvi: 0.106 },
  { date: '2024-10', ndvi: 0.11 },
  { date: '2024-11', ndvi: 0.127 },
  { date: '2024-12', ndvi: 0.125 },
  { date: '2025-01', ndvi: 0.116 },
  { date: '2025-02', ndvi: 0.138 },
  { date: '2025-03', ndvi: 0.133 },
  { date: '2025-04', ndvi: 0.107 },
  { date: '2025-05', ndvi: 0.112 },
  { date: '2025-06', ndvi: 0.113 },
  { date: '2025-07', ndvi: 0.108 },
  { date: '2025-08', ndvi: 0.107 },
  { date: '2025-09', ndvi: 0.099 },
  { date: '2025-10', ndvi: 0.099 },
  { date: '2025-11', ndvi: 0.103 },
  { date: '2025-12', ndvi: 0.103 },
  { date: '2026-01', ndvi: 0.1 },
  { date: '2026-02', ndvi: 0.097 },
  { date: '2026-03', ndvi: 0.116 },
];

const spiAnnual = [
  { year: '2015', spiMean: -0.148, droughtMonths: 3, wetMonths: 0 },
  { year: '2016', spiMean: -0.12, droughtMonths: 3, wetMonths: 0 },
  { year: '2017', spiMean: -0.259, droughtMonths: 0, wetMonths: 2 },
  { year: '2018', spiMean: 0.288, droughtMonths: 0, wetMonths: 0 },
  { year: '2019', spiMean: 0.137, droughtMonths: 0, wetMonths: 2 },
  { year: '2020', spiMean: 0.508, droughtMonths: 0, wetMonths: 4 },
  { year: '2021', spiMean: -0.702, droughtMonths: 2, wetMonths: 0 },
  { year: '2022', spiMean: -0.668, droughtMonths: 2, wetMonths: 0 },
  { year: '2023', spiMean: -0.092, droughtMonths: 3, wetMonths: 3 },
  { year: '2024', spiMean: -0.005, droughtMonths: 0, wetMonths: 0 },
  { year: '2025', spiMean: 0.016, droughtMonths: 0, wetMonths: 0 },
];

const spiRecent = [
  { date: '2023-01', spiMean: -1.433, category: 'Moderate Drought' },
  { date: '2023-02', spiMean: -0.95, category: 'Near Normal' },
  { date: '2023-03', spiMean: -0.791, category: 'Near Normal' },
  { date: '2023-04', spiMean: -0.45, category: 'Near Normal' },
  { date: '2023-05', spiMean: 0.256, category: 'Near Normal' },
  { date: '2023-06', spiMean: 1.705, category: 'Very Wet' },
  { date: '2023-07', spiMean: 3.108, category: 'Extremely Wet' },
  { date: '2023-08', spiMean: 1.182, category: 'Moderately Wet' },
  { date: '2023-09', spiMean: -0.839, category: 'Near Normal' },
  { date: '2023-10', spiMean: -1.227, category: 'Moderate Drought' },
  { date: '2023-11', spiMean: -1.548, category: 'Severe Drought' },
  { date: '2023-12', spiMean: -0.113, category: 'Near Normal' },
  { date: '2024-01', spiMean: -0.102, category: 'Near Normal' },
  { date: '2024-02', spiMean: 0.393, category: 'Near Normal' },
  { date: '2024-03', spiMean: -0.784, category: 'Near Normal' },
  { date: '2024-04', spiMean: -0.076, category: 'Near Normal' },
  { date: '2024-05', spiMean: -0.445, category: 'Near Normal' },
  { date: '2024-06', spiMean: 0.166, category: 'Near Normal' },
  { date: '2024-07', spiMean: -0.679, category: 'Near Normal' },
  { date: '2024-08', spiMean: -0.405, category: 'Near Normal' },
  { date: '2024-09', spiMean: 0.57, category: 'Near Normal' },
  { date: '2024-10', spiMean: 0.887, category: 'Near Normal' },
  { date: '2024-11', spiMean: 0.627, category: 'Near Normal' },
  { date: '2024-12', spiMean: -0.217, category: 'Near Normal' },
  { date: '2025-01', spiMean: -0.091, category: 'Near Normal' },
  { date: '2025-02', spiMean: 0.429, category: 'Near Normal' },
  { date: '2025-03', spiMean: 0.843, category: 'Near Normal' },
  { date: '2025-04', spiMean: 0.882, category: 'Near Normal' },
  { date: '2025-05', spiMean: 0.148, category: 'Near Normal' },
  { date: '2025-06', spiMean: 0.396, category: 'Near Normal' },
  { date: '2025-07', spiMean: -0.063, category: 'Near Normal' },
  { date: '2025-08', spiMean: -0.544, category: 'Near Normal' },
  { date: '2025-09', spiMean: 0.03, category: 'Near Normal' },
  { date: '2025-10', spiMean: -0.496, category: 'Near Normal' },
  { date: '2025-11', spiMean: -0.844, category: 'Near Normal' },
  { date: '2025-12', spiMean: -0.501, category: 'Near Normal' },
];

const speiAnnual = [
  { year: '2015', spei: -0.995, min: -1.465, max: -0.463 },
  { year: '2016', spei: -1.419, min: -1.747, max: -0.944 },
  { year: '2017', spei: -1.201, min: -1.73, max: -0.729 },
  { year: '2018', spei: -0.315, min: -1.013, max: 0.343 },
  { year: '2019', spei: -0.198, min: -0.639, max: 0.199 },
  { year: '2020', spei: -1.022, min: -1.373, max: -0.704 },
  { year: '2021', spei: -1.685, min: -2.243, max: -1.308 },
  { year: '2022', spei: -2.222, min: -2.631, max: -2.023 },
  { year: '2023', spei: -2.351, min: -2.796, max: -1.839 },
];

function formatMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getSpiColor(value: number) {
  if (value <= -1.5) return '#ef4444';
  if (value <= -1) return '#f97316';
  if (value >= 1.5) return '#06b6d4';
  if (value >= 1) return '#22c55e';
  return '#64748b';
}

function exportTaskData() {
  const sections = [
    ['NDVI annual summary'],
    ['year', 'avg', 'min', 'max'],
    ...ndviAnnual.map((item) => [item.year, item.avg, item.min, item.max]),
    [''],
    ['SPI-3 annual summary'],
    ['year', 'spiMean', 'droughtMonths', 'wetMonths'],
    ...spiAnnual.map((item) => [item.year, item.spiMean, item.droughtMonths, item.wetMonths]),
    [''],
    ['SPEI annual summary'],
    ['year', 'spei', 'min', 'max'],
    ...speiAnnual.map((item) => [item.year, item.spei, item.min, item.max]),
  ];

  const csvContent = sections.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'sfax_drought_monitoring_summary.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function DroughtMonitoring() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const basemapLayersRef = useRef<Record<string, any>>({});
  const latestNdvi = ndviAnnual[ndviAnnual.length - 1];
  const driestSpei = speiAnnual.reduce((lowest, item) => (item.spei < lowest.spei ? item : lowest), speiAnnual[0]);
  const mostDroughtMonths = spiAnnual.reduce(
    (highest, item) => (item.droughtMonths > highest.droughtMonths ? item : highest),
    spiAnnual[0],
  );
  const [mapLoading, setMapLoading] = useState(true);
  const [mapStatus, setMapStatus] = useState('Preparing NDVI composite...');
  const [basemap, setBasemap] = useState<'osm' | 'satellite' | 'topo'>('satellite');
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      await loadLeafletAssets();
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const L = window.L;
      const map = L.map(mapRef.current).setView([34.74, 10.76], 9);

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      });
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri' },
      ).addTo(map);
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
      });

      basemapLayersRef.current = {
        osm: osmLayer,
        satellite: satelliteLayer,
        topo: topoLayer,
      };
      mapInstanceRef.current = map;
      L.control.scale({ imperial: false, metric: true }).addTo(map);

      try {
        const response = await fetch('/sdg_task/sdg_task/NDVI_2015_2026_Composite.tif');
        if (!response.ok) throw new Error(`Failed to fetch TIFF: ${response.status}`);

        const arrayBuffer = await response.arrayBuffer();
        const tiff = await fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const data = (await image.readRasters()) as any;
        const width = image.getWidth();
        const height = image.getHeight();

        const fallbackBounds: [[number, number], [number, number]] = [
          [34.0, 10.0],
          [35.5, 11.5],
        ];

        let bounds = fallbackBounds;
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
            maxY <= 90;
          if (looksLikeLonLat) bounds = [[minY, minX], [maxY, maxX]];
        }

        const rasterData = data[0];
        if (!rasterData) throw new Error('No raster band found');

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create canvas context');

        const imageData = context.createImageData(width, height);
        for (let i = 0; i < rasterData.length; i++) {
          const value = Number(rasterData[i]);
          let alpha = 0;
          let red = 0;
          let green = 0;
          let blue = 0;

          if (Number.isFinite(value)) {
            const match = ndviClasses.find((item, index) =>
              index === ndviClasses.length - 1
                ? value >= item.min && value <= item.max
                : value >= item.min && value < item.max,
            );

            if (match) {
              [red, green, blue] = match.color;
              alpha = 205;
            }
          }

          imageData.data[i * 4] = red;
          imageData.data[i * 4 + 1] = green;
          imageData.data[i * 4 + 2] = blue;
          imageData.data[i * 4 + 3] = alpha;
        }

        context.putImageData(imageData, 0, 0);
        const overlay = L.imageOverlay(canvas.toDataURL('image/png'), bounds, {
          opacity: 0.82,
          interactive: true,
        });
        overlay.addTo(map);
        overlayRef.current = overlay;

        map.fitBounds(bounds);
        setMapStatus('ArcMap class breaks applied');
      } catch (error) {
        console.error(error);
        setMapStatus(error instanceof Error ? error.message : 'Failed to load TIFF');
      } finally {
        setMapLoading(false);
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
    const basemaps = basemapLayersRef.current;
    if (!map || !basemaps.osm) return;

    (['osm', 'satellite', 'topo'] as const).forEach((key) => {
      try {
        if (key === basemap) map.addLayer(basemaps[key]);
        else map.removeLayer(basemaps[key]);
      } catch {
        return;
      }
    });
  }, [basemap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const overlay = overlayRef.current;
    if (!map || !overlay) return;
    try {
      if (showOverlay) map.addLayer(overlay);
      else map.removeLayer(overlay);
    } catch {
      return;
    }
  }, [showOverlay]);

  return (
    <div className="p-6 space-y-8">
      <PageHero
        title="Drought Monitoring"
        action={
          <button
            onClick={exportTaskData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Download size={18} />
            Export Summary CSV
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FloatingCard>
          <div className="flex items-center gap-3 text-emerald-300">
            <Leaf size={18} />
            <p className="text-sm uppercase tracking-[0.18em]">Latest NDVI Avg</p>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{latestNdvi.avg.toFixed(3)}</p>
          <p className="mt-2 text-sm text-slate-400">Annual average for {latestNdvi.year}</p>
        </FloatingCard>

        <FloatingCard>
          <div className="flex items-center gap-3 text-orange-300">
            <Activity size={18} />
            <p className="text-sm uppercase tracking-[0.18em]">Most Drought Months</p>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{mostDroughtMonths.droughtMonths}</p>
          <p className="mt-2 text-sm text-slate-400">SPI-3 drought months in {mostDroughtMonths.year}</p>
        </FloatingCard>

        <FloatingCard>
          <div className="flex items-center gap-3 text-cyan-300">
            <Waves size={18} />
            <p className="text-sm uppercase tracking-[0.18em]">Lowest SPEI</p>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{driestSpei.spei.toFixed(3)}</p>
          <p className="mt-2 text-sm text-slate-400">Annual mean in {driestSpei.year}</p>
        </FloatingCard>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="relative h-[36rem]">
          <FloatingCard className="h-full overflow-hidden p-0">
            {mapLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 text-white">
                Loading NDVI composite map...
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" />
          </FloatingCard>
        </div>

        <div className="flex flex-col gap-6">
          <FloatingCard>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <MapIcon size={18} className="text-cyan-300" />
              NDVI GeoTIFF Map
            </h2>
          </FloatingCard>

          <FloatingCard>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              <Layers3 size={16} className="text-emerald-300" />
              Basemap
            </h3>
            <div className="space-y-2">
              {([
                ['satellite', 'Satellite'],
                ['osm', 'OpenStreetMap'],
                ['topo', 'Topographic'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setBasemap(value)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                    basemap === value
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{label}</span>
                  <span>{basemap === value ? 'On' : 'Off'}</span>
                </button>
              ))}
            </div>
          </FloatingCard>

          <FloatingCard>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white">Legend</h3>
            <button
              onClick={() => setShowOverlay((current) => !current)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors ${
                showOverlay
                  ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Raw NDVI Raster</span>
              <span>{showOverlay ? 'Visible' : 'Hidden'}</span>
            </button>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              {ndviClasses.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 h-3 w-3 rounded-sm"
                    style={{ backgroundColor: `rgb(${item.color[0]}, ${item.color[1]}, ${item.color[2]})` }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </FloatingCard>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <FloatingCard className="h-[28rem]">
          <h2 className="mb-2 text-xl font-semibold text-white">NDVI Annual Trend</h2>
          <p className="mb-6 text-sm text-slate-400">Vegetation vigor steadily improved through 2024-2025.</p>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={ndviAnnual}>
              <defs>
                <linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 16 }}
              />
              <Area type="monotone" dataKey="avg" stroke="#22c55e" strokeWidth={3} fill="url(#ndviFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </FloatingCard>

        <FloatingCard className="h-[28rem]">
          <h2 className="mb-2 text-xl font-semibold text-white">SPI-3 Annual Balance</h2>
          <p className="mb-6 text-sm text-slate-400">Negative values indicate drier-than-normal conditions.</p>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={spiAnnual}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 16 }}
              />
              <Bar dataKey="spiMean" radius={[10, 10, 0, 0]}>
                {spiAnnual.map((item) => (
                  <Cell key={item.year} fill={getSpiColor(item.spiMean)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </FloatingCard>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <FloatingCard className="h-[30rem]">
          <h2 className="mb-2 text-xl font-semibold text-white">Monthly SPI-3 Signal, 2023-2025</h2>
          <p className="mb-6 text-sm text-slate-400">Wet spike in mid-2023, then mostly near-normal conditions through 2025.</p>
          <ResponsiveContainer width="100%" height="84%">
            <LineChart data={spiRecent}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickFormatter={formatMonth}
                minTickGap={28}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => [value.toFixed(3), 'SPI-3 mean']}
                labelFormatter={(value) => formatMonth(String(value))}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 16 }}
              />
              <Line type="monotone" dataKey="spiMean" stroke="#38bdf8" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </FloatingCard>

        <FloatingCard className="h-[30rem]">
          <h2 className="mb-2 text-xl font-semibold text-white">Annual SPEI Stress</h2>
          <p className="mb-6 text-sm text-slate-400">SPEI shows prolonged moisture stress intensifying into 2022-2023.</p>
          <ResponsiveContainer width="100%" height="84%">
            <LineChart data={speiAnnual}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => [value.toFixed(3), 'SPEI']}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 16 }}
              />
              <Legend />
              <Line type="monotone" dataKey="spei" stroke="#f59e0b" strokeWidth={3} />
              <Line type="monotone" dataKey="min" stroke="#ef4444" strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </FloatingCard>
      </section>

      <section className="grid grid-cols-1 gap-8">
        <FloatingCard className="h-[26rem]">
          <h2 className="mb-2 text-xl font-semibold text-white">Recent NDVI Monthly Averages</h2>
          <p className="mb-6 text-sm text-slate-400">Recent vegetation response strengthens again in late 2024 and early 2025.</p>
          <ResponsiveContainer width="100%" height="82%">
            <LineChart data={ndviRecent}>
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tickFormatter={formatMonth}
                minTickGap={30}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => [value.toFixed(3), 'NDVI']}
                labelFormatter={(value) => formatMonth(String(value))}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: 16 }}
              />
              <Line type="monotone" dataKey="ndvi" stroke="#22c55e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </FloatingCard>
      </section>
    </div>
  );
}
