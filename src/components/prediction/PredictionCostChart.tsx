"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PredictionPoint } from "@/lib/predictionEmballageService";
import { Wallet, CalendarDays } from "lucide-react";

type Props = {
  data: PredictionPoint[];
  granularity?: "day" | "month" | "year";
};

function formatPeriod(periode: string, granularity?: "day" | "month" | "year") {
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

function CostTooltip({ active, payload, label }: any) {
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
        <span className="text-xs text-emerald-300">DT</span>
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Coût prévisionnel estimé
      </p>

      <div className="mt-2 h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
    </div>
  );
}

export default function PredictionCostChart({
  data,
  granularity = "month",
}: Props) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatPeriod(item.periode, granularity),
    cout_predite: Number(item.cout_predite || 0),
  }));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl shadow-emerald-100/60 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-300/40">
            <Wallet size={17} className="text-white" />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-800">
              Visualisation du coût prévisionnel
            </h2>
            <p className="text-xs text-slate-400">
              Coût estimé selon la quantité prédite et le prix unitaire du contrat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <CalendarDays size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">
            Coût prédit (DT)
          </span>
        </div>
      </div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
              </linearGradient>

              <linearGradient id="costStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#0ea5e9" />
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
              tickFormatter={(value) => `${value} DT`}
            />

            <Tooltip content={<CostTooltip />} />

            <Area
              type="monotone"
              dataKey="cout_predite"
              name="Coût prédit"
              stroke="url(#costStroke)"
              strokeWidth={3}
              fill="url(#costFill)"
              dot={{
                r: 3,
                fill: "#10b981",
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}