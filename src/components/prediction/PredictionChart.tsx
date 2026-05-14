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
import { Activity, CalendarDays } from "lucide-react";

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
        <span className="text-xs text-teal-300">unités</span>
      </div>

      <div className="mt-2 h-0.5 w-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400" />
    </div>
  );
}

function getChartTitle(granularity?: "day" | "month" | "year") {
  if (granularity === "day") return "Visualisation journalière";
  if (granularity === "year") return "Visualisation annuelle";
  return "Visualisation mensuelle";
}

function getChartDescription(granularity?: "day" | "month" | "year") {
  if (granularity === "day")
    return "Chaque barre représente la quantité prédite pour un jour du mois.";
  if (granularity === "year")
    return "Chaque point représente la quantité prédite pour une année.";
  return "Chaque point représente la quantité prédite pour un mois.";
}

export default function PredictionChart({ data, granularity = "month" }: Props) {
  const isDay = granularity === "day";

  return (
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
            Quantité prédite
          </span>
        </div>
      </div>

      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          {isDay ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.75} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="periode"
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
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
                </linearGradient>

                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="55%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="periode"
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
                dot={{ r: 3, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                animationDuration={1200}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}