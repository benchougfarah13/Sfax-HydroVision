import { useState } from "react";
import { Activity, Droplets, ShieldAlert, TestTube2 } from "lucide-react";
import FloatingCard from "../components/FloatingCard";
import PageHero from "../components/PageHero";

type SuitabilityClass = "C1S1" | "C2S1" | "C2S2" | "C3S2" | "C3S3" | "C4S4";
type WhoClass = "Excellent" | "Good" | "Fair" | "Poor" | "Unacceptable";

interface Delegation {
  id: string;
  name: string;
  ec: number;
  tds: number;
  ph: number;
  sar: number;
  nitrates: number;
  suitability: SuitabilityClass;
  whoClass: WhoClass;
  lat: number;
  lng: number;
}

const DELEGATIONS: Delegation[] = [
  { id: "sfax-ville", name: "Sfax Ville", ec: 2.1, tds: 1344, ph: 7.4, sar: 4.2, nitrates: 18, suitability: "C2S1", whoClass: "Good", lat: 34.74, lng: 10.76 },
  { id: "sakiet-ezzit", name: "Sakiet Ezzit", ec: 1.4, tds: 896, ph: 7.1, sar: 2.8, nitrates: 12, suitability: "C2S1", whoClass: "Excellent", lat: 34.81, lng: 10.72 },
  { id: "sfax-ouest", name: "Sfax Ouest", ec: 3.8, tds: 2432, ph: 7.8, sar: 7.1, nitrates: 34, suitability: "C3S2", whoClass: "Fair", lat: 34.73, lng: 10.68 },
  { id: "menzel-chaker", name: "Menzel Chaker", ec: 5.2, tds: 3328, ph: 7.9, sar: 9.4, nitrates: 52, suitability: "C3S3", whoClass: "Poor", lat: 34.98, lng: 10.42 },
  { id: "agareb", name: "Agareb", ec: 1.8, tds: 1152, ph: 7.2, sar: 3.1, nitrates: 15, suitability: "C2S1", whoClass: "Good", lat: 34.74, lng: 10.56 },
  { id: "jebeniana", name: "Jebeniana", ec: 4.1, tds: 2624, ph: 8.0, sar: 8.2, nitrates: 44, suitability: "C3S2", whoClass: "Fair", lat: 35.0, lng: 10.86 },
  { id: "el-amra", name: "El Amra", ec: 6.8, tds: 4352, ph: 8.2, sar: 11.3, nitrates: 68, suitability: "C4S4", whoClass: "Unacceptable", lat: 35.06, lng: 11.01 },
  { id: "bir-ali-ben-khelifa", name: "Bir Ali Ben Khelifa", ec: 3.2, tds: 2048, ph: 7.6, sar: 6.1, nitrates: 28, suitability: "C3S2", whoClass: "Fair", lat: 34.73, lng: 10.1 },
  { id: "skhira", name: "Skhira", ec: 7.4, tds: 4736, ph: 8.3, sar: 12.8, nitrates: 74, suitability: "C4S4", whoClass: "Unacceptable", lat: 34.3, lng: 10.07 },
  { id: "mahres", name: "Mahres", ec: 2.9, tds: 1856, ph: 7.5, sar: 5.3, nitrates: 26, suitability: "C2S2", whoClass: "Good", lat: 34.54, lng: 10.5 },
  { id: "kerkennah", name: "Kerkennah", ec: 8.1, tds: 5184, ph: 8.4, sar: 14.1, nitrates: 81, suitability: "C4S4", whoClass: "Unacceptable", lat: 34.72, lng: 11.18 },
  { id: "el-hencha", name: "El Hencha", ec: 2.4, tds: 1536, ph: 7.3, sar: 4.6, nitrates: 19, suitability: "C2S1", whoClass: "Good", lat: 34.96, lng: 10.64 },
];

const SUITABILITY_META: Record<
  SuitabilityClass,
  { label: string; color: string; bg: string; description: string }
> = {
  C1S1: { label: "C1S1", color: "#5eead4", bg: "rgba(94,234,212,0.14)", description: "Excellent: low salinity and low sodium risk." },
  C2S1: { label: "C2S1", color: "#7dd3fc", bg: "rgba(125,211,252,0.14)", description: "Good: moderate salinity with low sodium risk." },
  C2S2: { label: "C2S2", color: "#facc15", bg: "rgba(250,204,21,0.14)", description: "Fair: moderate salinity and moderate sodium risk." },
  C3S2: { label: "C3S2", color: "#fb923c", bg: "rgba(251,146,60,0.14)", description: "Marginal: high salinity with moderate sodium risk." },
  C3S3: { label: "C3S3", color: "#f97316", bg: "rgba(249,115,22,0.15)", description: "Unsuitable: high salinity and high sodium risk." },
  C4S4: { label: "C4S4", color: "#f43f5e", bg: "rgba(244,63,94,0.15)", description: "Hazardous: very high salinity and sodium hazard." },
};

const WHO_META: Record<WhoClass, { color: string; bg: string }> = {
  Excellent: { color: "#5eead4", bg: "rgba(94,234,212,0.14)" },
  Good: { color: "#7dd3fc", bg: "rgba(125,211,252,0.14)" },
  Fair: { color: "#facc15", bg: "rgba(250,204,21,0.14)" },
  Poor: { color: "#fb923c", bg: "rgba(251,146,60,0.14)" },
  Unacceptable: { color: "#f43f5e", bg: "rgba(244,63,94,0.15)" },
};

function ecToSalinityColor(ec: number) {
  if (ec <= 1.5) return "#5eead4";
  if (ec <= 2.5) return "#38bdf8";
  if (ec <= 4.0) return "#facc15";
  if (ec <= 6.0) return "#fb923c";
  if (ec <= 7.5) return "#f97316";
  return "#f43f5e";
}

function getStats() {
  const ecs = DELEGATIONS.map((delegation) => delegation.ec);
  const avg = ecs.reduce((sum, current) => sum + current, 0) / ecs.length;
  const maxZone = [...DELEGATIONS].sort((a, b) => b.ec - a.ec)[0];
  const bestZone = [...DELEGATIONS].sort((a, b) => a.ec - b.ec)[0];
  const unsafe = DELEGATIONS.filter(
    (delegation) => delegation.whoClass === "Poor" || delegation.whoClass === "Unacceptable",
  ).length;

  return {
    avg: avg.toFixed(1),
    maxZone,
    bestZone,
    unsafe,
  };
}

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

function StatCard({
  label,
  value,
  unit,
  sub,
  color,
  accent,
  Icon,
}: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  color: string;
  accent: string;
  Icon: typeof Activity;
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
          {unit ? <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span> : null}
        </p>
        <p className="mt-3 text-sm text-slate-300">{sub}</p>
      </div>
    </FloatingCard>
  );
}

function ClassBadge({
  label,
  color,
  background,
}: {
  label: string;
  color: string;
  background: string;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ color, background, borderColor: `${color}40` }}
    >
      {label}
    </span>
  );
}

function SchematicMap({
  delegations,
  extentDelegations,
  selected,
  onSelect,
}: {
  delegations: Delegation[];
  extentDelegations: Delegation[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const lats = extentDelegations.map((delegation) => delegation.lat);
  const lngs = extentDelegations.map((delegation) => delegation.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const toX = (lng: number) => 48 + ((lng - minLng) / (maxLng - minLng || 1)) * 468;
  const toY = (lat: number) => 34 + (1 - (lat - minLat) / (maxLat - minLat || 1)) * 300;

  return (
    <svg viewBox="0 0 560 380" className="h-full w-full">
      <defs>
        <linearGradient id="mapGlow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.20)" />
          <stop offset="100%" stopColor="rgba(94,234,212,0.02)" />
        </linearGradient>
      </defs>

      <rect x="18" y="18" width="524" height="344" rx="26" fill="url(#mapGlow)" stroke="rgba(255,255,255,0.05)" />

      {[0, 1, 2, 3].map((index) => (
        <line
          key={`h-${index}`}
          x1="42"
          y1={54 + index * 74}
          x2="518"
          y2={54 + index * 74}
          stroke="rgba(148,163,184,0.09)"
          strokeDasharray="4 10"
        />
      ))}
      {[0, 1, 2, 3, 4].map((index) => (
        <line
          key={`v-${index}`}
          x1={56 + index * 92}
          y1="42"
          x2={56 + index * 92}
          y2="338"
          stroke="rgba(148,163,184,0.08)"
          strokeDasharray="4 10"
        />
      ))}

      {delegations.map((delegation, index) =>
        delegations.slice(index + 1).map((other) => {
          const dist = Math.sqrt((delegation.lat - other.lat) ** 2 + (delegation.lng - other.lng) ** 2);
          if (dist > 0.55) return null;

          return (
            <line
              key={`${delegation.id}-${other.id}`}
              x1={toX(delegation.lng)}
              y1={toY(delegation.lat)}
              x2={toX(other.lng)}
              y2={toY(other.lat)}
              stroke="rgba(148,163,184,0.12)"
              strokeWidth="1"
            />
          );
        }),
      )}

      {delegations.map((delegation) => {
        const cx = toX(delegation.lng);
        const cy = toY(delegation.lat);
        const color = ecToSalinityColor(delegation.ec);
        const isSelected = delegation.id === selected;

        return (
          <g key={delegation.id} onClick={() => onSelect(delegation.id)} className="cursor-pointer">
            {isSelected ? (
              <circle cx={cx} cy={cy} r={22} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.65" />
            ) : null}
            <circle cx={cx} cy={cy} r={isSelected ? 11 : 8} fill={`${color}22`} stroke={color} strokeWidth={isSelected ? 2.2 : 1.5} />
            <circle cx={cx} cy={cy} r={isSelected ? 5 : 3.5} fill={color} />
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fill={isSelected ? "#e2e8f0" : "#94a3b8"}
              fontSize={isSelected ? 10 : 9}
              fontWeight={isSelected ? 700 : 500}
            >
              {delegation.name.split(" ")[0]}
            </text>
          </g>
        );
      })}

      <g transform="translate(502,54)">
        <circle cx="0" cy="0" r="15" fill="rgba(2, 6, 23, 0.8)" stroke="rgba(255,255,255,0.08)" />
        <text x="0" y="-3" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">
          N
        </text>
        <line x1="0" y1="2" x2="0" y2="-9" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points="0,-11 -3,-4 3,-4" fill="#94a3b8" />
      </g>

      <g transform="translate(46,336)">
        {["#5eead4", "#38bdf8", "#facc15", "#fb923c", "#f97316", "#f43f5e"].map((color, index) => (
          <rect key={color} x={index * 26} y="0" width="22" height="8" rx="3" fill={color} />
        ))}
        <text x="0" y="22" fill="#94a3b8" fontSize="9">
          Low EC
        </text>
        <text x="130" y="22" fill="#94a3b8" fontSize="9">
          High EC
        </text>
      </g>
    </svg>
  );
}

export default function WaterQuality() {
  const [activeTab, setActiveTab] = useState<"map" | "table">("map");
  const [selectedId, setSelectedId] = useState<string | null>("sfax-ville");
  const [filterWho, setFilterWho] = useState<WhoClass | "All">("All");
  const [sortBy, setSortBy] = useState<"name" | "ec" | "tds" | "sar">("ec");

  const stats = getStats();
  const selectedDelegation = DELEGATIONS.find((delegation) => delegation.id === selectedId) ?? DELEGATIONS[0];

  const visibleDelegations =
    filterWho === "All" ? DELEGATIONS : DELEGATIONS.filter((delegation) => delegation.whoClass === filterWho);

  const filtered = [...visibleDelegations].sort((a, b) =>
    sortBy === "name" ? a.name.localeCompare(b.name) : b[sortBy] - a[sortBy],
  );

  const suitabilityCounts = Object.keys(SUITABILITY_META).reduce((acc, key) => {
    acc[key as SuitabilityClass] = DELEGATIONS.filter((delegation) => delegation.suitability === key).length;
    return acc;
  }, {} as Record<SuitabilityClass, number>);

  return (
    <div className="space-y-8 p-6">
      <PageHero
        title="Water Quality"
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <StatCard
          label="Average EC"
          value={stats.avg}
          unit="dS/m"
          sub="Governorate-wide conductivity mean"
          color="#38bdf8"
          accent="rgba(56,189,248,0.18)"
          Icon={Activity}
        />
        <StatCard
          label="Highest EC"
          value={stats.maxZone.ec.toFixed(1)}
          unit="dS/m"
          sub={stats.maxZone.name}
          color="#f43f5e"
          accent="rgba(244,63,94,0.18)"
          Icon={ShieldAlert}
        />
        <StatCard
          label="Best Zone"
          value={stats.bestZone.ec.toFixed(1)}
          unit="dS/m"
          sub={stats.bestZone.name}
          color="#5eead4"
          accent="rgba(94,234,212,0.18)"
          Icon={Droplets}
        />
        <StatCard
          label="At-Risk Zones"
          value={formatCount(stats.unsafe)}
          sub="Poor or unacceptable WHO class"
          color="#fb923c"
          accent="rgba(251,146,60,0.18)"
          Icon={TestTube2}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <FloatingCard>
          <div className="space-y-6 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-2">
            <div className="grid gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-start">
              <div className="rounded-2xl bg-slate-950/80 p-1">
                {(["map", "table"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === tab
                        ? "bg-cyan-400/15 text-cyan-200"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {tab === "map" ? "Map View" : "Table View"}
                  </button>
                  ))}
              </div>

              <div className="space-y-4 w-full">
                <div className="grid items-start gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">WHO filter</span>
                    <span className="text-xs text-slate-600">Filter map and table by class</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["All", "Excellent", "Good", "Fair", "Poor", "Unacceptable"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterWho(status)}
                        className={`min-h-[3rem] rounded-2xl border px-3 py-2 text-sm font-semibold transition-all ${
                          filterWho === status
                            ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.08)_inset]"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-slate-200"
                        }`}
                      >
                        <span className="block text-center">{status}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Sort table</span>
                    <span className="text-xs text-slate-600">Choose table priority</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(["name", "ec", "tds", "sar"] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className={`min-h-[3rem] rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
                          sortBy === option
                            ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.08)_inset]"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:bg-white/[0.05] hover:text-slate-200"
                        }`}
                      >
                        {option.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </div>

            {activeTab === "map" ? (
              <div className="rounded-2xl border border-white/5 bg-black/10 p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Spatial Snapshot</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">Sfax Water Quality Network</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(["Excellent", "Good", "Fair", "Poor", "Unacceptable"] as const).map((status) => (
                      <span key={status} className="inline-flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: WHO_META[status].color }} />
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-[28rem]">
                  <SchematicMap
                    delegations={visibleDelegations}
                    extentDelegations={DELEGATIONS}
                    selected={selectedId}
                    onSelect={setSelectedId}
                  />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/10">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Delegation", "EC", "TDS", "pH", "SAR", "NO3", "FAO", "WHO"].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((delegation, index) => (
                      <tr
                        key={delegation.id}
                        onClick={() => setSelectedId(delegation.id)}
                        className={`cursor-pointer border-b border-white/5 ${
                          selectedId === delegation.id ? "bg-cyan-400/8" : index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-200">{delegation.name}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: ecToSalinityColor(delegation.ec) }}>
                          {delegation.ec.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{delegation.tds.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-300">{delegation.ph.toFixed(1)}</td>
                        <td className="px-4 py-3 text-slate-300">{delegation.sar.toFixed(1)}</td>
                        <td className={`px-4 py-3 ${delegation.nitrates > 50 ? "font-semibold text-rose-300" : "text-slate-300"}`}>
                          {delegation.nitrates}
                        </td>
                        <td className="px-4 py-3">
                          <ClassBadge
                            label={delegation.suitability}
                            color={SUITABILITY_META[delegation.suitability].color}
                            background={SUITABILITY_META[delegation.suitability].bg}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ClassBadge
                            label={delegation.whoClass}
                            color={WHO_META[delegation.whoClass].color}
                            background={WHO_META[delegation.whoClass].bg}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FloatingCard>

        <div className="flex flex-col gap-6">
          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">FAO Distribution</p>
              <div className="mt-5 space-y-4">
                {(Object.keys(SUITABILITY_META) as SuitabilityClass[]).map((classification) => {
                  const count = suitabilityCounts[classification];
                  const percent = (count / DELEGATIONS.length) * 100;
                  const meta = SUITABILITY_META[classification];

                  return (
                    <div key={classification}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-slate-500">
                          {count} / {DELEGATIONS.length}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: meta.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FloatingCard>

          <FloatingCard>
            <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected Zone</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{selectedDelegation.name}</h2>

              <div className="my-6 flex justify-center">
                <svg viewBox="0 0 120 80" className="w-44">
                  <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M 10 70 A 50 50 0 0 1 110 70"
                    fill="none"
                    stroke={ecToSalinityColor(selectedDelegation.ec)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(selectedDelegation.ec / 10, 1) * 157} 157`}
                  />
                  <text x="60" y="62" textAnchor="middle" fill={ecToSalinityColor(selectedDelegation.ec)} fontSize="20" fontWeight="700">
                    {selectedDelegation.ec.toFixed(1)}
                  </text>
                  <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="9">
                    dS/m EC
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "TDS", value: `${selectedDelegation.tds.toLocaleString()} mg/L` },
                  { key: "pH", value: selectedDelegation.ph.toFixed(1) },
                  { key: "SAR", value: selectedDelegation.sar.toFixed(1) },
                  {
                    key: "NO3",
                    value: `${selectedDelegation.nitrates} mg/L`,
                    warn: selectedDelegation.nitrates > 50,
                  },
                ].map((item) => (
                  <div key={item.key} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.key}</p>
                    <p className={`mt-1 text-sm font-semibold ${item.warn ? "text-rose-300" : "text-slate-100"}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ClassBadge
                  label={selectedDelegation.suitability}
                  color={SUITABILITY_META[selectedDelegation.suitability].color}
                  background={SUITABILITY_META[selectedDelegation.suitability].bg}
                />
                <ClassBadge
                  label={selectedDelegation.whoClass}
                  color={WHO_META[selectedDelegation.whoClass].color}
                  background={WHO_META[selectedDelegation.whoClass].bg}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                {SUITABILITY_META[selectedDelegation.suitability].description}
              </p>
            </div>
          </FloatingCard>
        </div>
      </div>

    </div>
  );
}
