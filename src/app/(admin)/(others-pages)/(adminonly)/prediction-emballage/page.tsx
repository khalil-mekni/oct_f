"use client";

import { useEffect, useState, useRef } from "react";
import PredictionFilters, {
  ENTREPOTS,
  FilterParams,
} from "@/components/prediction/PredictionFilters";
import PredictionChart from "@/components/prediction/PredictionChart";
import PredictionStats from "@/components/prediction/PredictionStats";
import {
  getPredictionEmballage,
  PredictionPoint,
} from "@/lib/predictionEmballageService";
import {
  TableProperties,
  Bot,
  AlertCircle,
  InboxIcon,
  TrendingUp,
  DatabaseZap,
  RefreshCw,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUp,
  Minus,
  ArrowDown,
  Package,
  Activity,
  Zap,
  Target,
} from "lucide-react";
import PredictionCostStats from "@/components/prediction/PredictionCostStats";
import PredictionCostChart from "@/components/prediction/PredictionCostChart";
import PredictionRecommendation from "@/components/prediction/PredictionRecommendation";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildRequestForEntrepot(params: FilterParams, entrepotId: number) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  if (params.granularity === "day") {
    const month = String(params.selectedMonth).padStart(2, "0");

    return {
      emballageId: params.emballageId,
      entrepotId,
      granularity: "day" as const,
      periods: getDaysInMonth(params.selectedYear, params.selectedMonth),
      startDate: `${params.selectedYear}-${month}-01`,
    };
  }

  if (params.granularity === "month") {
    const startMonth = String(nextMonth).padStart(2, "0");

    const monthsCount =
      params.selectedYear === nextMonthYear
        ? 12 - nextMonth + 1
        : 12;

    return {
      emballageId: params.emballageId,
      entrepotId,
      granularity: "month" as const,
      periods: monthsCount,
      startDate: `${params.selectedYear}-${startMonth}-01`,
    };
  }

  const startMonth = String(nextMonth).padStart(2, "0");

  const periods =
    (params.toYear - nextMonthYear) * 12 + (12 - nextMonth + 1);

  return {
    emballageId: params.emballageId,
    entrepotId,
    granularity: "month" as const,
    periods,
    startDate: `${nextMonthYear}-${startMonth}-01`,
  };
}

function mergePredictions(allResults: PredictionPoint[][]): PredictionPoint[] {
  const map = new Map<
    string,
    {
      quantite_predite: number;
      cout_predite: number;
      unite: string;
      prix_unitaire: number;
      stock_actuel: number;
      stock_securite: number;
      stock_restant_prevu: number;
      quantite_recommandee: number;
      cout_recommande: number;
    }
  >();

  allResults.flat().forEach((item) => {
    const existing = map.get(item.periode);

    map.set(item.periode, {
      quantite_predite:
        (existing?.quantite_predite ?? 0) + Number(item.quantite_predite),
      cout_predite:
        (existing?.cout_predite ?? 0) + Number(item.cout_predite ?? 0),
      unite: existing?.unite ?? item.unite ?? "unités",
      prix_unitaire: item.prix_unitaire ?? existing?.prix_unitaire ?? 0,
      stock_actuel: (existing?.stock_actuel ?? 0) + Number(item.stock_actuel),
      stock_securite: (existing?.stock_securite ?? 0) + Number(item.stock_securite),
      stock_restant_prevu: (existing?.stock_restant_prevu ?? 0) + Number(item.stock_restant_prevu),
      quantite_recommandee: (existing?.quantite_recommandee ?? 0) + Number(item.quantite_recommandee),
      cout_recommande: (existing?.cout_recommande ?? 0) + Number(item.cout_recommande),
    });
  });

  return Array.from(map.entries())
    .map(([periode, value]) => ({
      periode,
      quantite_predite: Number(value.quantite_predite.toFixed(2)),
      cout_predite: Number(value.cout_predite.toFixed(2)),
      unite: value.unite,
      prix_unitaire: value.prix_unitaire,
      stock_actuel: Number(value.stock_actuel.toFixed(2)),
      stock_securite: Number(value.stock_securite.toFixed(2)),
      stock_restant_prevu: Number(value.stock_restant_prevu.toFixed(2)),
      quantite_recommandee: Number(value.quantite_recommandee.toFixed(2)),
      cout_recommande: Number(value.cout_recommande.toFixed(2)),
      alerte_rupture: value.stock_restant_prevu <= value.stock_securite,
    }))
    .sort((a, b) => a.periode.localeCompare(b.periode));
}

/* ─────────────────────────────────────────────
   Skeleton Loader
───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="oct-card animate-pulse p-5">
      <div className="mb-3 h-3 w-24 rounded-full bg-slate-200" />
      <div className="mb-2 h-8 w-32 rounded-xl bg-slate-200" />
      <div className="h-2 w-full rounded-full bg-slate-100" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {/* Chart skeleton */}
      <div className="oct-card animate-pulse p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-full bg-slate-200" />
            <div className="h-3 w-28 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="flex items-end gap-2 pt-2" style={{ height: 200 }}>
          {[60, 80, 45, 90, 70, 55, 85, 40, 75, 65, 50, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-gradient-to-t from-slate-200 to-slate-100"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Error State
───────────────────────────────────────────── */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="oct-card border-red-200/70 bg-red-50/40 p-10 text-center">
      <div className="mb-5 flex justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <AlertCircle size={28} className="text-red-500" />
          <div className="absolute inset-0 animate-ping rounded-2xl bg-red-200 opacity-30" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-red-800">Erreur de prédiction</h3>
      <p className="mb-6 text-sm text-red-600/80">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-red-500/40 active:scale-95"
      >
        <RefreshCw size={14} />
        Réessayer
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty State
───────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="oct-card p-14 text-center">
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 via-teal-100 to-emerald-100">
          {/* Animated rings */}
          <div className="absolute inset-0 animate-[ping_3s_ease-in-out_infinite] rounded-3xl bg-teal-200 opacity-20" />
          <InboxIcon size={36} className="text-teal-500" />
          <div className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg">
            <Bot size={14} className="text-white" />
          </div>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800">Aucune prédiction générée</h3>
      <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate-500">
        Configurez vos filtres ci-dessus puis cliquez sur{" "}
        <strong className="text-teal-600">Lancer la prédiction</strong> pour visualiser les quantités prévisionnelles.
      </p>
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><Package size={12} />Emballage</span>
        <span className="text-slate-200">→</span>
        <span className="flex items-center gap-1.5"><Layers size={12} />Entrepôt</span>
        <span className="text-slate-200">→</span>
        <span className="flex items-center gap-1.5"><Activity size={12} />Période</span>
        <span className="text-slate-200">→</span>
        <span className="flex items-center gap-1.5 text-teal-500"><Zap size={12} />Prédiction</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Animated Number
───────────────────────────────────────────── */
function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const from = useRef(0);

  useEffect(() => {
    const start = from.current;
    const end = value;
    const duration = 800;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else { from.current = end; startRef.current = null; }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{displayed.toFixed(decimals)}</>;
}

/* ─────────────────────────────────────────────
   Need Level Badge
───────────────────────────────────────────── */
function NeedBadge({ pct }: { pct: number }) {
  if (pct >= 85) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
      <ArrowUp size={9} />Pic prévu
    </span>
  );
  if (pct >= 60) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
      <TrendingUp size={9} />Besoin élevé
    </span>
  );
  if (pct >= 35) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-700">
      <Minus size={9} />Besoin moyen
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
      <ArrowDown size={9} />Faible besoin
    </span>
  );
}

/* ─────────────────────────────────────────────
   Prediction Detail — Ranked Timeline
───────────────────────────────────────────── */

/** Heatmap color for the fill dot/bar based on intensity */
function heatColor(pct: number): string {
  if (pct >= 85) return "#10b981"; // emerald
  if (pct >= 60) return "#0ea5e9"; // sky
  if (pct >= 35) return "#14b8a6"; // teal
  return "#94a3b8";                // slate
}

function heatBg(pct: number): string {
  if (pct >= 85) return "bg-emerald-50 border-emerald-200/60";
  if (pct >= 60) return "bg-sky-50 border-sky-200/60";
  if (pct >= 35) return "bg-teal-50/70 border-teal-200/50";
  return "bg-slate-50 border-slate-200/40";
}

function heatText(pct: number): string {
  if (pct >= 85) return "text-emerald-700";
  if (pct >= 60) return "text-sky-700";
  if (pct >= 35) return "text-teal-700";
  return "text-slate-500";
}

type SortKey = "chronologique" | "decroissant" | "croissant";

function PredictionTable({
  data,
  granularity,
}: {
  data: PredictionPoint[];
  granularity: "day" | "month" | "year";
}) {
  const [sort, setSort] = useState<SortKey>("chronologique");
  const [showAll, setShowAll] = useState(false);

  if (data.length === 0) return <EmptyState />;

  const max = Math.max(...data.map((d) => d.quantite_predite));
  const total = data.reduce((sum, d) => sum + d.quantite_predite, 0);
  const avg = total / data.length;

  const getLabel = (periode: string) => {
    const date = new Date(periode);
    if (granularity === "day")
      return date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
    if (granularity === "month")
      return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return date.getFullYear().toString();
  };

  const getFullLabel = (periode: string) => {
    const date = new Date(periode);
    if (granularity === "day")
      return date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    if (granularity === "month")
      return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return date.getFullYear().toString();
  };

  const sorted = [...data].sort((a, b) => {
    if (sort === "decroissant") return b.quantite_predite - a.quantite_predite;
    if (sort === "croissant") return a.quantite_predite - b.quantite_predite;
    return a.periode.localeCompare(b.periode);
  });

  const PAGE = 8;
  const visible = showAll ? sorted : sorted.slice(0, PAGE);
  const hasMore = sorted.length > PAGE;

  const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: "chronologique", label: "Chronologique", icon: <Activity size={12} /> },
    { key: "decroissant", label: "Plus élevé", icon: <ArrowUp size={12} /> },
    { key: "croissant", label: "Plus faible", icon: <ArrowDown size={12} /> },
  ];

  return (
    <div className="space-y-5">

      {/* ── Top KPI strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total prévu", value: total, unit: data[0]?.unite || "unités", icon: <Target size={15} />, accent: "text-sky-600", dot: "bg-sky-500" },
          { label: "Moyenne / période", value: avg, unit: data[0]?.unite || "unités", icon: <BarChart3 size={15} />, accent: "text-teal-600", dot: "bg-teal-500" },
          { label: "Pic de consommation", value: max, unit: data[0]?.unite || "unités", icon: <TrendingUp size={15} />, accent: "text-emerald-600", dot: "bg-emerald-500" },
        ].map((k, i) => (
          <div key={i} className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${k.dot} bg-opacity-15`}>
              <span className={k.accent}>{k.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{k.label}</p>
              <p className={`text-xl font-black tabular-nums ${k.accent}`}>
                <AnimatedNumber value={k.value} decimals={2} />
              </p>
              <p className="text-[10px] text-slate-400">{k.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sort controls ── */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-400">
          {sorted.length} période{sorted.length > 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-white/70 p-1 shadow-sm">
          {sortOptions.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all duration-200
                ${sort === o.key
                  ? "bg-gradient-to-r from-sky-500 to-teal-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
                }`}
            >
              {o.icon}
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ranked list ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white/60 shadow-sm backdrop-blur-sm">
        {/* Header row */}
        <div className="grid items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400"
          style={{ gridTemplateColumns: "2rem 1fr 9rem 5rem 5rem" }}>
          <span>#</span>
          <span>Période</span>
          <span>Barre de consommation</span>
          <span className="text-right">Quantité</span>
          <span className="text-right">Niveau</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {visible.map((item, idx) => {
            const rankInSorted = sorted.indexOf(item);
            const pct = max > 0 ? (item.quantite_predite / max) * 100 : 0;
            const isPeak = item.quantite_predite === max;
            const color = heatColor(pct);

            return (
              <div
                key={item.periode}
                className={`group grid items-center gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-slate-50/80
                  ${isPeak ? "bg-emerald-50/40" : ""}`}
                style={{ gridTemplateColumns: "2rem 1fr 9rem 5rem 5rem" }}
              >
                {/* Rank */}
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-extrabold
                  ${isPeak ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                  {rankInSorted + 1}
                </div>

                {/* Period label */}
                <div className="min-w-0">
                  <p className={`truncate text-sm font-bold capitalize ${isPeak ? "text-emerald-800" : "text-slate-800"}`}>
                    {getLabel(item.periode)}
                  </p>
                  {granularity === "day" && (
                    <p className="truncate text-[10px] text-slate-400">{getFullLabel(item.periode)}</p>
                  )}
                </div>

                {/* Heat bar */}
                <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.85 }}
                  />
                  {/* Shimmer on peak */}
                  {isPeak && (
                    <div className="absolute inset-0 animate-[shimmer_2s_infinite] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  )}
                </div>

                {/* Quantity */}
                <div className="text-right">
                  <p className="text-sm font-black tabular-nums text-slate-900">
                    {item.quantite_predite.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400">
  {item.unite || "unités"}
</p>
                </div>

                {/* Badge */}
                <div className="flex justify-end">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${heatBg(pct)} ${heatText(pct)}`}>
                    {isPeak
                      ? <><Zap size={8} />Pic</>
                      : pct >= 60
                      ? <><ArrowUp size={8} />Élevé</>
                      : pct >= 35
                      ? <><Minus size={8} />Moyen</>
                      : <><ArrowDown size={8} />Faible</>
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more */}
        {hasMore && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:text-teal-700 hover:shadow"
            >
              {showAll
                ? <><ArrowUp size={12} />Réduire</>
                : <><Layers size={12} />Voir les {sorted.length - PAGE} autres périodes</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function PredictionEmballagePage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  const [params, setParams] = useState<FilterParams>({
  emballageId: 1,
  entrepotId: null,
  granularity: "month",
  selectedMonth: nextMonth,
  selectedYear: nextMonthYear,
  fromYear: nextMonthYear,
  toYear: nextMonthYear + 1,
});

  const [data, setData] = useState<PredictionPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  async function loadPrediction() {
    try {
      setLoading(true);
      setError("");
      setVisible(false);

      if (params.entrepotId === null) {
        const results = await Promise.all(
          ENTREPOTS.map((entrepot) =>
            getPredictionEmballage(buildRequestForEntrepot(params, entrepot.id))
          )
        );
        setData(mergePredictions(results));
      } else {
        const result = await getPredictionEmballage(
          buildRequestForEntrepot(params, params.entrepotId)
        );
        setData(result);
      }

      setTimeout(() => setVisible(true), 50);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la prédiction.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Global styles */}
      <style>{`
        .oct-card {
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(20px);
          box-shadow: 0 4px 24px -4px rgba(14, 116, 144, 0.08), 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
        }
        .oct-card:hover {
          box-shadow: 0 8px 40px -6px rgba(14, 116, 144, 0.14), 0 2px 8px rgba(0,0,0,0.05);
        }
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.5s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .badge-ml {
          background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.12));
          border: 1px solid rgba(20,184,166,0.3);
        }
      `}</style>

      <div className="relative min-h-screen bg-gradient-to-br from-sky-50/70 via-slate-50 to-teal-50/60 px-4 py-8 md:px-8 lg:px-10">

        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-sky-200/25 blur-3xl" />
          <div className="absolute -left-20 top-1/3 h-[420px] w-[420px] rounded-full bg-teal-200/18 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-[380px] w-[380px] rounded-full bg-emerald-200/15 blur-3xl" />
          <div className="absolute left-1/4 top-0 h-[200px] w-[200px] rounded-full bg-cyan-200/20 blur-2xl" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "radial-gradient(circle, #0284c7 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        <div className="mx-auto max-w-7xl space-y-7">

          {/* ── Header ── */}
          <div className="fade-up flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" style={{ animationDelay: "0ms" }}>
            <div>
              {/* ML Badge */}
              <div className="badge-ml mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-teal-700 shadow-sm">
                <div className="relative flex h-4 w-4 items-center justify-center">
                  <Sparkles size={11} className="text-teal-600" />
                </div>
                <span>Système décisionnel</span>
                <span className="mx-1 text-teal-300">·</span>
                <DatabaseZap size={11} />
                <span>Prédiction ML</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Prédiction des besoins{" "}
                <span className="bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  en emballages
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 lg:text-base">
                Estimation intelligente des quantités nécessaires à consommer selon l'emballage, l'entrepôt et la période. Anticipez vos besoins de stock et évitez les ruptures.
              </p>
            </div>

            {/* Live indicator */}
            {!loading && data.length > 0 && (
              <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {data.length} période{data.length > 1 ? "s" : ""} prédite{data.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── Filters ── */}
          <div className="fade-up" style={{ animationDelay: "80ms" }}>
            <PredictionFilters
              params={params}
              onChange={setParams}
              onSubmit={loadPrediction}
              loading={loading}
            />
          </div>

          {/* ── Error ── */}
          {error && !loading && (
            <div className="fade-up" style={{ animationDelay: "0ms" }}>
              <ErrorState message={error} onRetry={loadPrediction} />
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div className="fade-up" style={{ animationDelay: "0ms" }}>
              <LoadingState />
            </div>
          )}

          {/* ── Content (visible after data loads) ── */}
          {!loading && (
            <div className={`space-y-7 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

              {/* Stats */}
              <PredictionStats data={data} />
               
              <PredictionCostStats data={data} /> 
              {/* Chart */}
              {data.length > 0 ? (
                <div className="oct-card overflow-hidden">
                  <div className="inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-400" />
                  <div className="p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg shadow-teal-300/30">
                        <BarChart3 size={17} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-800">Visualisation prévisionnelle</h2>
                        <p className="text-xs text-slate-400">Quantités estimées par période</p>
                      </div>
                    </div>
                    <PredictionChart data={data} granularity={params.granularity} />
                    <PredictionCostChart data={data} granularity={params.granularity} />
                  </div>
                </div>
              ) : (
                !error && <EmptyState />
              )}

              {/* Recommendation */}
              {data.length > 0 && (
                <PredictionRecommendation 
                  data={data} 
                  granularity={params.granularity} 
                  emballageId={params.emballageId}
                />
              )}

              {/* Prediction detail table */}
              {data.length > 0 && (
                <div className="oct-card relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400" />
                  <div className="p-6 lg:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-emerald-300/30">
                        <TableProperties size={17} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-800">Détails des prédictions</h2>
                        <p className="text-xs text-slate-400">
                          Analyse période par période · Quantité prévue à consommer en unités
                        </p>
                      </div>
                    </div>

                    <PredictionTable data={data} granularity={params.granularity} />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  );
}