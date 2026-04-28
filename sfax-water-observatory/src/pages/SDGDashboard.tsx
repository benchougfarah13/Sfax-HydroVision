import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Droplets,
  FlaskConical,
  LocateFixed,
  Shield,
  Waves,
} from "lucide-react";
import FloatingCard from "../components/FloatingCard";

function OverviewCard({
  title,
  description,
  accent,
  Icon,
  to,
}: {
  title: string;
  description: string;
  accent: string;
  Icon: typeof Activity;
  to: string;
}) {
  return (
    <Link to={to} className="block">
      <FloatingCard className="h-full overflow-hidden transition-transform duration-200 hover:-translate-y-1">
        <div className="h-full rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl p-3" style={{ background: `${accent}22` }}>
              <Icon size={20} color={accent} />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
            Open page
            <ArrowRight size={16} />
          </div>
        </div>
      </FloatingCard>
    </Link>
  );
}

export default function SDGDashboard() {
  return (
    <div className="space-y-8 p-6">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-2 py-10 text-center md:px-4 md:py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.22),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.18),transparent_22%),linear-gradient(180deg,rgba(3,8,24,0),rgba(8,23,43,0.35))]" />
        <div className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 opacity-80">
          <svg viewBox="0 0 1600 320" className="h-[18rem] w-full" preserveAspectRatio="none">
            <path
              d="M0 118C80 105 160 92 240 97C320 102 400 124 480 136C560 148 640 150 720 137C800 124 880 96 960 91C1040 86 1120 104 1200 117C1280 130 1360 138 1440 132C1493 128 1547 118 1600 108"
              fill="none"
              stroke="rgba(103,232,249,0.55)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M0 154C66 171 133 188 200 187C266 186 333 166 400 152C466 138 533 130 600 136C666 142 733 162 800 171C866 180 933 178 1000 165C1066 152 1133 128 1200 120C1266 112 1333 120 1400 131C1466 142 1533 156 1600 157"
              fill="none"
              stroke="rgba(45,212,191,0.48)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M0 196C72 181 145 166 218 167C290 168 363 184 436 197C509 210 581 220 654 215C727 210 800 190 872 180C945 170 1018 170 1090 179C1163 188 1236 206 1309 210C1381 214 1454 204 1527 192C1551 188 1576 184 1600 180"
              fill="none"
              stroke="rgba(34,211,238,0.38)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[-2%] -z-10 opacity-75">
          <svg viewBox="0 0 1600 420" className="h-[24rem] w-full" preserveAspectRatio="none">
            <path
              d="M0 230C84 214 168 198 252 203C336 208 421 234 505 241C589 248 673 236 757 219C842 202 926 180 1010 183C1094 186 1178 214 1263 219C1347 224 1431 205 1515 190C1543 185 1572 180 1600 176V420H0Z"
              fill="rgba(34,211,238,0.14)"
            />
            <path
              d="M0 270C94 291 188 312 282 306C376 300 470 267 564 251C658 235 752 237 847 251C941 265 1035 291 1129 292C1223 293 1317 267 1411 245C1474 230 1537 221 1600 212V420H0Z"
              fill="rgba(45,212,191,0.14)"
            />
            <path
              d="M0 168C53 159 106 149 160 153C213 157 266 175 320 189C373 203 426 213 480 208C533 203 586 183 640 172C693 161 746 159 800 170C853 181 906 204 960 209C1013 214 1066 202 1120 187C1173 172 1226 154 1280 153C1333 152 1386 168 1440 173C1493 178 1546 172 1600 166"
              fill="none"
              stroke="rgba(103,232,249,0.6)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M0 208C64 218 128 228 192 224C256 220 320 202 384 187C448 172 512 160 576 164C640 168 704 188 768 198C832 208 896 208 960 198C1024 188 1088 168 1152 157C1216 146 1280 144 1344 152C1408 160 1472 178 1536 179C1557 179 1579 177 1600 175"
              fill="none"
              stroke="rgba(45,212,191,0.48)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex max-w-5xl flex-col items-center gap-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Water Intelligence Platform
            </div>
            <h1 className="mt-6 text-6xl font-black tracking-[-0.04em] text-white md:text-7xl xl:text-8xl">
              Sfax <span className="bg-[linear-gradient(90deg,#67e8f9,#22d3ee,#34d399)] bg-clip-text text-transparent">HydroVision</span>
            </h1>
          </div>
        </div>
      </section>

      <FloatingCard>
        <div className="rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(7,17,33,0.82),rgba(3,10,24,0.96))] p-6">
          <h2 className="text-2xl font-semibold text-white">Platform Overview</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300">
            This platform brings together the main water-related views available in the project, including spatial hotspot mapping,
            water proximity by delegation, water quality indicators, DRASTIC groundwater vulnerability, and drought monitoring layers.
          </p>
        </div>
      </FloatingCard>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <OverviewCard
          title="Water Proximity"
          description="Compare delegation distances to dams, lakes, and rivers through summary cards, charts, and tables."
          accent="#34d399"
          Icon={Waves}
          to="/climate"
        />
        <OverviewCard
          title="Water Quality"
          description="Review EC, TDS, SAR, nitrates, and FAO or WHO classes across the available delegation sample."
          accent="#f59e0b"
          Icon={FlaskConical}
          to="/water-quality"
        />
        <OverviewCard
          title="DRASTIC Vulnerability"
          description="View the DRASTIC raster map, switch basemaps, and inspect the distribution of vulnerability classes."
          accent="#f43f5e"
          Icon={Shield}
          to="/Drastic"
        />
        <OverviewCard
          title="Hotspot Identification"
          description="Explore the hotspot map with water features, urban areas, and stress layers to identify priority zones."
          accent="#38bdf8"
          Icon={LocateFixed}
          to="/observatory"
        />
        <OverviewCard
          title="Drought Monitoring"
          description="Open the drought page to see the NDVI GeoTIFF map, classified vegetation styling, and climate signal summaries."
          accent="#eab308"
          Icon={Droplets}
          to="/drought-monitoring"
        />
      <OverviewCard
          title="Impact Stimulator"
          description="Test a zone-based investment scenario and estimate how many people may benefit across multiple water-related dimensions."
          accent="#22d3ee"
          Icon={Activity}
          to="/impact-stimulator"
        />
      </section>
    </div>
  );
}
