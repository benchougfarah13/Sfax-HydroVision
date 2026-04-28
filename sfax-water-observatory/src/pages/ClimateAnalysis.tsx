import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Download, Droplets, Waves, Mountain } from "lucide-react";
import PageHero from "../components/PageHero";
import FloatingCard from "../components/FloatingCard";

const RAW_DATA = [
  { delegation: "Agareb", dam: 25.35, lake: 33.72, river: 4.37, population: 46652},
  { delegation: "Bir Ali Ben Khelifa", dam: 51.14, lake: 26.26, river: 4.22, population: 55339 },
  { delegation: "El Amra", dam: 21.52, lake: 30.84, river: 2.31, population: 35808 },
  { delegation: "El Ghraiba", dam: 64.89, lake: 63.12, river: 1.71, population: 16678},
  { delegation: "Hencha", dam: 25.26, lake: 7.83, river: 1.83, population: 55434},
  { delegation: "Jebeniana", dam: 32.34, lake: 19.88, river: 1.19, population: 58364 },
  { delegation: "Kerkennah", dam: 51.38, lake: 58.2, river: 5.09, population: 15382},
  { delegation: "Mahres", dam: 47.84, lake: 53.0, river: 2.94, population: 35698 },
  { delegation: "Menzel Chaker", dam: 27.96, lake: 3.96, river: 1.55, population: 42546 },
  { delegation: "Sakiet Eddaier", dam: 18.43, lake: 40.28, river: 0.95, population: 123457},
  { delegation: "Sakiet Ezzit", dam: 4.57, lake: 28.08, river: 1.16, population: 96648 },
  { delegation: "Sfax Medina", dam: 19.73, lake: 41.15, river: 3.93, population: 97712 },
  { delegation: "Sfax Ouest", dam: 18.06, lake: 38.51, river: 0.92, population: 105238 },
  { delegation: "Sfax Sud", dam: 23.06, lake: 41.04, river: 1.78, population: 142716 },
  { delegation: "Skhira", dam: 83.4, lake: 70.99, river: 2.07, population: 40035 },
];

const SORT_OPTIONS = [
  { key: "dam", label: "Dam distance" },
  { key: "lake", label: "Lake distance" },
  { key: "river", label: "River distance" },
  { key: "population", label: "Population" },
] as const;

const DISTANCE_BANDS = [
  { max: 5, color: "#34d399", label: "<= 5 km" },
  { max: 15, color: "#38bdf8", label: "5-15 km" },
  { max: 30, color: "#f59e0b", label: "15-30 km" },
  { max: 50, color: "#fb7185", label: "30-50 km" },
  { max: Infinity, color: "#ef4444", label: "> 50 km" },
];

const METRIC_CONFIG = {
  dam: { label: "Distance to Dam", color: "#fb7185", accent: "rgba(251,113,133,0.18)", Icon: Mountain },
  lake: { label: "Distance to Lake", color: "#38bdf8", accent: "rgba(56,189,248,0.18)", Icon: Waves },
  river: { label: "Distance to River", color: "#34d399", accent: "rgba(52,211,153,0.18)", Icon: Droplets },
} as const;

function getBandColor(value: number) {
  for (const band of DISTANCE_BANDS) {
    if (value <= band.max) return band.color;
  }
  return DISTANCE_BANDS[DISTANCE_BANDS.length - 1].color;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function MetricCard({
  label,
  delegation,
  value,
  color,
  accent,
  Icon,
}: {
  label: string;
  delegation: string;
  value: string;
  color: string;
  accent: string;
  Icon: any;
}) {
  return (
    <FloatingCard className="overflow-hidden">
      <div
        className="rounded-2xl border p-5"
        style={{ background: "linear-gradient(180deg, rgba(7,17,33,0.82), rgba(3,10,24,0.96))", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: accent }}>
            <Icon size={18} color={color} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        </div>
        <p className="text-4xl font-bold" style={{ color }}>
          {value}
          <span className="ml-1 text-sm font-medium text-slate-400">km</span>
        </p>
        <p className="mt-3 text-sm font-semibold text-slate-200">{delegation}</p>
      </div>
    </FloatingCard>
  );
}

function DataTable({
  data,
  metric,
}: {
  data: typeof RAW_DATA;
  metric: keyof typeof METRIC_CONFIG;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {["#", "Delegation", "Dam (km)", "Lake (km)", "River (km)", "Population"].map((heading) => (
              <th
                key={heading}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 ${
                  heading === "Delegation" || heading === "#" ? "text-left" : "text-right"
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.delegation} className="border-b border-white/5 odd:bg-white/[0.02]">
              <td className="px-4 py-3 text-slate-500">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-200">{row.delegation}</td>
              {(["dam", "lake", "river"] as const).map((key) => (
                <td
                  key={key}
                  className="px-4 py-3 text-right"
                  style={{
                    color: metric === key ? getBandColor(row[key]) : "#94a3b8",
                    fontWeight: metric === key ? 700 : 500,
                  }}
                >
                  {row[key].toFixed(2)}
                </td>
              ))}
              <td className="px-4 py-3 text-right text-slate-300">{formatNumber(row.population)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {(["dam", "lake", "river"] as const).map((key) => {
        const cfg = METRIC_CONFIG[key];
        const Icon = cfg.Icon;
        const values = RAW_DATA.map((row) => row[key]);
        const avg = (values.reduce((sum, current) => sum + current, 0) / values.length).toFixed(1);
        const min = Math.min(...values).toFixed(2);
        const max = Math.max(...values).toFixed(2);

        return (
          <div
            key={key}
            className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-[linear-gradient(160deg,rgba(10,20,38,0.98),rgba(4,10,24,0.98))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
          >
            <div
              className="mb-4 h-1 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${cfg.color}, transparent)`,
              }}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl p-3" style={{ background: cfg.accent }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{cfg.label}</p>
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black tracking-tight" style={{ color: cfg.color }}>
                    {avg}
                  </p>
                  <span className="pb-1 text-sm font-medium text-slate-500">avg km</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Range</p>
                <p className="mt-2 text-sm text-slate-300">
                  Min <span className="font-bold text-emerald-300">{min}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Max <span className="font-bold text-rose-300">{max}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/6 bg-black/20 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Distance Profile</span>
              <div className="flex items-center gap-2">
                {DISTANCE_BANDS.map((band) => (
                  <span
                    key={band.label}
                    className="h-2.5 w-10 rounded-full"
                    style={{ backgroundColor: band.color, opacity: band.max >= Number(avg) ? 1 : 0.35 }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  metric: keyof typeof METRIC_CONFIG;
}

function CustomTooltip({ active, payload, label, metric }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value as number;
  const color = getBandColor(value);
  return (
    <div
      style={{
        background: "rgba(2, 10, 24, 0.96)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        minWidth: 170,
      }}
    >
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      <p style={{ color, fontSize: 24, fontWeight: 800, margin: 0 }}>
        {value.toFixed(2)}
        <span style={{ fontSize: 12, color: "#64748b", marginLeft: 4, fontWeight: 500 }}>km</span>
      </p>
      <p style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{METRIC_CONFIG[metric].label}</p>
    </div>
  );
}

export default function NearestWaterFeatures() {
  const [sortKey, setSortKey] = useState<(typeof SORT_OPTIONS)[number]["key"]>("population");
  const [metric, setMetric] = useState<keyof typeof METRIC_CONFIG>("dam");
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");

  const sorted = [...RAW_DATA].sort((a, b) =>
    sortKey === "population" ? b.population - a.population : a[sortKey] - b[sortKey],
  );

  const chartData = sorted.map((row) => ({
    delegation: row.delegation.length > 12 ? `${row.delegation.slice(0, 12)}...` : row.delegation,
    fullName: row.delegation,
    value: row[metric],
  }));

  const nearest = {
    dam: [...RAW_DATA].sort((a, b) => a.dam - b.dam)[0],
    lake: [...RAW_DATA].sort((a, b) => a.lake - b.lake)[0],
    river: [...RAW_DATA].sort((a, b) => a.river - b.river)[0],
  };

  const exportCSV = () => {
    const headers = ["Delegation", "Dam (km)", "Lake (km)", "River (km)", "Population"];
    const rows = RAW_DATA.map((row) => [row.delegation, row.dam, row.lake, row.river, row.population]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sfax_water_distances.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 p-6">
      <PageHero
        title="Water Proximity"
        action={
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            <Download size={16} />
            Export CSV
          </button>
        }
      />

      <SummaryStrip />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MetricCard
          label="Closest to Dam"
          delegation={nearest.dam.delegation}
          value={nearest.dam.dam.toFixed(2)}
          color={METRIC_CONFIG.dam.color}
          accent={METRIC_CONFIG.dam.accent}
          Icon={Mountain}
        />
        <MetricCard
          label="Closest to Lake"
          delegation={nearest.lake.delegation}
          value={nearest.lake.lake.toFixed(2)}
          color={METRIC_CONFIG.lake.color}
          accent={METRIC_CONFIG.lake.accent}
          Icon={Waves}
        />
        <MetricCard
          label="Closest to River"
          delegation={nearest.river.delegation}
          value={nearest.river.river.toFixed(2)}
          color={METRIC_CONFIG.river.color}
          accent={METRIC_CONFIG.river.accent}
          Icon={Droplets}
        />
      </section>

      <FloatingCard>
        <div className="space-y-6 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-2">
          <div className="grid gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
            <div className="rounded-2xl bg-slate-950/80 p-1">
              {(["chart", "table"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-cyan-400/15 text-cyan-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {tab === "chart" ? "Chart View" : "Table View"}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Focus metric</span>
                <span className="text-xs text-slate-600">Changes chart emphasis</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(METRIC_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setMetric(key as keyof typeof METRIC_CONFIG)}
                    className="rounded-2xl border px-4 py-2 text-sm font-semibold transition-all"
                    style={{
                      borderColor: metric === key ? `${cfg.color}66` : "rgba(255,255,255,0.08)",
                      background: metric === key ? cfg.accent : "rgba(255,255,255,0.03)",
                      color: metric === key ? cfg.color : "#94a3b8",
                      boxShadow: metric === key ? `0 0 0 1px ${cfg.color}18 inset` : "none",
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Sort by</span>
                <span className="text-xs text-slate-600">Changes ranking order</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortKey(option.key)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
                      sortKey === option.key
                        ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.08)_inset]"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeTab === "chart" ? (
            <div className="rounded-2xl border border-white/5 bg-black/10 p-6">
              <div className="mb-5 flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Active View</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{METRIC_CONFIG[metric].label}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {DISTANCE_BANDS.map((band) => (
                    <span key={band.label} className="inline-flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: band.color }} />
                      {band.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-[28rem] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 80 }} barCategoryGap="18%">
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis
                      dataKey="delegation"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      angle={-38}
                      textAnchor="end"
                      interval={0}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value} km`}
                    />
                    <Tooltip content={(props: any) => <CustomTooltip {...props} metric={metric} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={getBandColor(entry.value)} fillOpacity={0.92} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-black/10 p-2">
              <DataTable data={sorted} metric={metric} />
            </div>
          )}
        </div>
      </FloatingCard>

    </div>
  );
}
