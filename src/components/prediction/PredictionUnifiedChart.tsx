"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { PredictionPoint } from "@/lib/predictionEmballageService";
import { Activity, TrendingUp, Wallet } from "lucide-react";

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

  if (granularity === "year") {
    return date.getFullYear().toString();
  }

  return date.toLocaleDateString("fr-FR", {
    month: "short",
    year: "numeric",
  });
}

function UnifiedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const quantite = payload.find((p: any) => p.dataKey === "quantite_predite");
  const cout = payload.find((p: any) => p.dataKey === "cout_predite");

  return (
    <div className="rounded-2xl border border-white/40 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <div className="space-y-4">
        {quantite && (
          <div className="flex flex-col border-l-2 border-sky-500 pl-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
              Quantité Prédite
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">
                {Number(quantite.value).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[10px] font-bold text-sky-300">
                {quantite.payload.unite || "unités"}
              </span>
            </div>
          </div>
        )}

        {cout && (
          <div className="flex flex-col border-l-2 border-emerald-500 pl-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Montant Estimé
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">
                {Number(cout.value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-bold text-emerald-300">DT</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 opacity-50" />
    </div>
  );
}

export default function PredictionUnifiedChart({
  data,
  granularity = "month",
}: Props) {
  const chartData = data.map((item) => ({
    ...item,
    formattedLabel: formatPeriod(item.periode, granularity),
    quantite_predite: Number(item.quantite_predite || 0),
    cout_predite: Number(item.cout_predite || 0),
  }));

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/40 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-sky-100/40">
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

      <div className="relative mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200/50">
            <Activity size={24} />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800">
              Analyse Prévisionnelle Unifiée
            </h2>
            <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantités vs Montants</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50/50 px-4 py-2 transition-colors hover:bg-sky-100/50">
            <TrendingUp size={14} className="text-sky-500" />
            <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Stock Prévu</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-2 transition-colors hover:bg-emerald-100/50">
            <Wallet size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Coût Estimé</span>
          </div>
        </div>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="quantiteBarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="coutAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />

            <XAxis
              dataKey="formattedLabel"
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              dy={10}
            />

            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#0ea5e9", fontWeight: 800 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.toLocaleString()}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#10b981", fontWeight: 800 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val} DT`}
            />

            <Tooltip content={<UnifiedTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.4 }} />
            
            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36}
              content={(props: any) => {
                return null; // We use our custom header legend
              }}
            />

            <Bar
              yAxisId="left"
              dataKey="quantite_predite"
              name="Quantité"
              fill="url(#quantiteBarFill)"
              radius={[6, 6, 0, 0]}
              barSize={granularity === "day" ? 12 : 24}
              animationDuration={1500}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cout_predite"
              name="Montant"
              stroke="#10b981"
              strokeWidth={4}
              fill="url(#coutAreaFill)"
              dot={{ r: 5, fill: "#10b981", strokeWidth: 3, stroke: "#fff" }}
              activeDot={{ r: 8, fill: "#0ea5e9", strokeWidth: 3, stroke: "#fff" }}
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-center gap-8 border-t border-slate-100/50 pt-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Consommation Prévue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Courbe des Coûts</span>
        </div>
      </div>
    </div>
  );
}

