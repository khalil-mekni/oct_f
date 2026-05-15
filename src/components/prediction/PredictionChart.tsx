"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PredictionPoint } from "@/lib/predictionEmballageService";
import {
  Activity,
  CalendarDays,
  Flame,
  Snowflake,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

type Props = {
  data: PredictionPoint[];
  granularity?: "day" | "month" | "year";
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/40 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-white">
          {Number(payload[0].value).toFixed(2)}
        </span>
        <span className="text-xs text-teal-300">
          {payload[0]?.payload?.unite || "unités"}
        </span>
      </div>

      <div className="mt-2 h-0.5 w-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400" />
    </div>
  );
}

function getChartTitle(granularity?: "day" | "month" | "year") {
  if (granularity === "day") return "Tendance journalière";
  if (granularity === "year") return "Tendance pluriannuelle";
  return "Tendance mensuelle";
}

function getChartDescription(granularity?: "day" | "month" | "year") {
  if (granularity === "day")
    return "Chaque barre représente la quantité prévue à consommer pour un jour.";
  if (granularity === "year")
    return "La visualisation affiche l’évolution mensuelle sur la plage d’années choisie.";
  return "Chaque point représente la quantité prévue à consommer pour un mois.";
}

function getPeriodLabel(periode: string, granularity?: "day" | "month" | "year") {
  const date = new Date(periode);

  if (granularity === "day") {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  }

  return date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

function getAnalytics(data: PredictionPoint[]) {
  if (data.length === 0) {
    return {
      maxItem: null,
      minItem: null,
      growth: 0,
      alertCount: 0,
      trendLabel: "Aucune donnée",
    };
  }

  const sorted = [...data].sort(
    (a, b) => a.quantite_predite - b.quantite_predite
  );

  const minItem = sorted[0];
  const maxItem = sorted[sorted.length - 1];

  const first = data[0].quantite_predite;
  const last = data[data.length - 1].quantite_predite;

  const growth = first > 0 ? ((last - first) / first) * 100 : 0;

  const avg =
    data.reduce((sum, item) => sum + item.quantite_predite, 0) / data.length;

  const alertThreshold = avg * 1.2;

  const alertCount = data.filter(
    (item) => item.quantite_predite >= alertThreshold
  ).length;

  let trendLabel = "Stable";

  if (growth > 10) trendLabel = "Tendance croissante";
  if (growth < -10) trendLabel = "Tendance décroissante";

  return {
    maxItem,
    minItem,
    growth,
    alertCount,
    trendLabel,
  };
}

export default function PredictionChart({ data, granularity = "month" }: Props) {
  const isDay = granularity === "day";
  const unite = data[0]?.unite || "unités";

  const { maxItem, minItem, growth, alertCount, trendLabel } =
    getAnalytics(data);

  const chartData = data.map((item) => ({
    ...item,
    label: getPeriodLabel(item.periode, granularity),
  }));

  const cards = [
    {
      title: "Période la plus active",
      value: maxItem ? getPeriodLabel(maxItem.periode, granularity) : "—",
      quantity: maxItem ? `${maxItem.quantite_predite.toFixed(2)} ${unite}` : "",
      icon: Flame,
      color: "from-rose-500 to-orange-400",
      bg: "from-rose-50 to-orange-50",
      text: "text-rose-700",
    },
    {
      title: "Période la moins active",
      value: minItem ? getPeriodLabel(minItem.periode, granularity) : "—",
      quantity: minItem ? `${minItem.quantite_predite.toFixed(2)} ${unite}` : "",
      icon: Snowflake,
      color: "from-sky-500 to-cyan-400",
      bg: "from-sky-50 to-cyan-50",
      text: "text-sky-700",
    },
    {
      title: "Croissance",
      value: `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`,
      quantity: trendLabel,
      icon: TrendingUp,
      color: "from-teal-500 to-emerald-400",
      bg: "from-teal-50 to-emerald-50",
      text: growth >= 0 ? "text-emerald-700" : "text-red-600",
    },
    {
      title: "Alertes besoin élevé",
      value: `${alertCount}`,
      quantity: "période(s) au-dessus de la moyenne",
      icon: AlertTriangle,
      color: "from-amber-500 to-yellow-400",
      bg: "from-amber-50 to-yellow-50",
      text: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br ${card.bg} p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
              >
                <Icon size={18} className="text-white" />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {card.title}
              </p>

              <p className={`mt-1 text-xl font-black ${card.text}`}>
                {card.value}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {card.quantity}
              </p>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-6 shadow-2xl shadow-sky-100/70 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400" />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg shadow-teal-300/40">
              <Activity size={17} className="text-white" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                {getChartTitle(granularity)}
              </h2>
              <p className="text-xs text-slate-400">
                {getChartDescription(granularity)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2">
            <CalendarDays size={14} className="text-teal-600" />
            <span className="text-xs font-bold text-teal-700">
              Quantité prévue à consommer ({unite})
            </span>
          </div>
        </div>

        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {isDay ? (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="barPrediction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.75} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="quantite_predite"
                  name="Quantité prédite"
                  fill="url(#barPrediction)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorPrediction"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
                  </linearGradient>

                  <linearGradient
                    id="strokeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="55%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />

                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="quantite_predite"
                  name="Quantité prédite"
                  stroke="url(#strokeGradient)"
                  strokeWidth={3}
                  fill="url(#colorPrediction)"
                  dot={{
                    r: 3,
                    fill: "#14b8a6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#0ea5e9",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  animationDuration={1200}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}