import { useState } from "react";
import { Droplets, HeartHandshake, ShieldCheck, Sparkles, Target, Waves } from "lucide-react";
import FloatingCard from "../components/FloatingCard";
import PageHero from "../components/PageHero";

const IMPACT_ZONES = [
  { name: "Agareb", population: 46652, riverKm: 4.37, whoClass: "Good", hotspot: 0.59 },
  { name: "Bir Ali Ben Khelifa", population: 55339, riverKm: 4.22, whoClass: "Fair", hotspot: 0.64 },
  { name: "El Amra", population: 35808, riverKm: 2.31, whoClass: "Unacceptable", hotspot: 0.83 },
  { name: "Jebeniana", population: 58364, riverKm: 1.19, whoClass: "Fair", hotspot: 0.72 },
  { name: "Kerkennah", population: 15382, riverKm: 5.09, whoClass: "Unacceptable", hotspot: 0.78 },
  { name: "Mahres", population: 35698, riverKm: 2.94, whoClass: "Good", hotspot: 0.61 },
  { name: "Menzel Chaker", population: 42546, riverKm: 1.55, whoClass: "Poor", hotspot: 0.76 },
  { name: "Sakiet Ezzit", population: 96648, riverKm: 1.16, whoClass: "Excellent", hotspot: 0.52 },
  { name: "Sfax Ouest", population: 105238, riverKm: 0.92, whoClass: "Fair", hotspot: 0.74 },
  { name: "Skhira", population: 40035, riverKm: 2.07, whoClass: "Unacceptable", hotspot: 0.81 },
  { name: "Hencha", population: 55434, riverKm: 1.83, whoClass: "Good", hotspot: 0.58 },
] as const;

const INVESTMENT_LEVELS = [
  { key: "starter", label: "Starter", factor: 0.18, note: "Light intervention" },
  { key: "growth", label: "Growth", factor: 0.32, note: "Balanced improvement" },
  { key: "transform", label: "Transform", factor: 0.48, note: "High-impact package" },
] as const;

function ResultCard({
  title,
  value,
  detail,
  color,
  accent,
  Icon,
}: {
  title: string;
  value: string;
  detail: string;
  color: string;
  accent: string;
  Icon: typeof Droplets;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl p-3" style={{ background: accent }}>
          <Icon size={18} color={color} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">{detail}</p>
        </div>
      </div>
      <p className="mt-4 text-3xl font-black" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function ImpactStimulator() {
  const [selectedZone, setSelectedZone] = useState<(typeof IMPACT_ZONES)[number]["name"]>("Sfax Ouest");
  const [investmentLevel, setInvestmentLevel] = useState<(typeof INVESTMENT_LEVELS)[number]["key"]>("growth");

  const zone = IMPACT_ZONES.find((entry) => entry.name === selectedZone) ?? IMPACT_ZONES[0];
  const level = INVESTMENT_LEVELS.find((entry) => entry.key === investmentLevel) ?? INVESTMENT_LEVELS[1];

  const waterNeedMultiplier =
    zone.whoClass === "Unacceptable" ? 1 :
    zone.whoClass === "Poor" ? 0.78 :
    zone.whoClass === "Fair" ? 0.56 :
    zone.whoClass === "Good" ? 0.32 : 0.18;

  const proximityNeedMultiplier = Math.min(zone.riverKm / 5.5, 1);
  const hotspotNeedMultiplier = Math.min(zone.hotspot, 1);

  const safeWaterImpact = Math.round(zone.population * level.factor * waterNeedMultiplier);
  const proximityImpact = Math.round(zone.population * level.factor * proximityNeedMultiplier);
  const hotspotImpact = Math.round(zone.population * level.factor * hotspotNeedMultiplier);
  const totalImpact = safeWaterImpact + proximityImpact + hotspotImpact;
  const relativeImpact = totalImpact / zone.population;
  const impactLevel =
    relativeImpact >= 0.6 ? "High Impact" :
    relativeImpact >= 0.35 ? "Medium Impact" :
    "Low Impact";

  return (
    <div className="space-y-8 p-6">
      <PageHero
        title="Impact Stimulator"
      />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <FloatingCard>
          <div className="space-y-6 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Scenario Builder</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">Choose where to invest</h2>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Impact Level</p>
                <p className="mt-1 text-3xl font-black text-white">{impactLevel}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Target zone</span>
                <span className="text-xs text-slate-600">Based on existing page data</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {IMPACT_ZONES.map((entry) => (
                  <button
                    key={entry.name}
                    onClick={() => setSelectedZone(entry.name)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      selectedZone === entry.name
                        ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {entry.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Investment level</span>
                <span className="text-xs text-slate-600">Adjust intervention strength</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {INVESTMENT_LEVELS.map((entry) => (
                  <button
                    key={entry.key}
                    onClick={() => setInvestmentLevel(entry.key)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      investmentLevel === entry.key
                        ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">{entry.label}</p>
                    <p className="mt-1 text-xs opacity-80">{entry.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
              <div className="mb-4 flex items-center gap-3">
                <Target size={18} className="text-amber-300" />
                <p className="text-sm font-semibold text-white">Selected zone profile</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Population</p>
                  <p className="mt-1 text-lg font-semibold text-white">{zone.population.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">WHO class</p>
                  <p className="mt-1 text-lg font-semibold text-white">{zone.whoClass}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">River proximity</p>
                  <p className="mt-1 text-lg font-semibold text-white">{zone.riverKm.toFixed(2)} km</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Hotspot pressure</p>
                  <p className="mt-1 text-lg font-semibold text-white">{zone.hotspot.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard>
          <div className="space-y-5 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(8,19,36,0.95),rgba(2,8,20,0.98))] p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated Outcomes</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Investment effect for {zone.name}</h2>
            </div>

            <ResultCard
              title="People gaining safer water conditions"
              value={safeWaterImpact.toLocaleString()}
              detail="Estimated from water quality class and local population"
              color="#67e8f9"
              accent="rgba(103,232,249,0.12)"
              Icon={Droplets}
            />
            <ResultCard
              title="People better connected to water features"
              value={proximityImpact.toLocaleString()}
              detail="Estimated from proximity to river features and local population"
              color="#34d399"
              accent="rgba(52,211,153,0.12)"
              Icon={Waves}
            />
            <ResultCard
              title="People better protected from hotspot pressure"
              value={hotspotImpact.toLocaleString()}
              detail="Estimated from hotspot intensity and local population"
              color="#fb7185"
              accent="rgba(251,113,133,0.12)"
              Icon={ShieldCheck}
            />
          </div>
        </FloatingCard>
      </section>
    </div>
  );
}
