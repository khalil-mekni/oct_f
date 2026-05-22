"use client";

import { useDeliveryNotesWidget } from "@/hooks/useDeliveryNotesWidget";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Cell 
} from "recharts";
import { ClipboardCheck, TrendingUp, AlertCircle, Package, Truck } from "lucide-react";

/* ─── Custom Tooltip ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3 shadow-xl text-xs">
        <p className="font-bold text-slate-800 dark:text-white mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
              </div>
              <span className="font-black tabular-nums">{entry.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-1.5 mt-1.5 border-t border-slate-100 dark:border-white/5">
             <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Écart:</span>
                <span className="font-bold text-rose-500">
                  {Math.max(0, payload[0].value - payload[1].value).toLocaleString()}
                </span>
             </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* ─── Main ─────────────────────────────────────────────────── */

export default function DeliveryQuantitiesWidget() {
  const { data, isLoading, isError } = useDeliveryNotesWidget();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse h-[400px]">
        <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-white/10 mb-8" />
        <div className="h-64 rounded-2xl bg-slate-50 dark:bg-white/5" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center h-[400px] flex flex-col items-center justify-center">
        <AlertCircle className="size-10 text-rose-500 mb-2" />
        <p className="text-rose-700 font-bold">Impossible de charger les quantités</p>
      </div>
    );
  }

  // On prépare les données pour le graphique
  const chartData = data.recentDeliveryNotes
    .filter(n => n.quantite_commandee !== undefined)
    .map(n => ({
      name: n.numero_bl,
      commandé: n.quantite_commandee || 0,
      reçu: n.quantite_recue || 0,
    }))
    .slice(0, 6);

  const totalCommanded = chartData.reduce((acc, curr) => acc + curr.commandé, 0);
  const totalReceived = chartData.reduce((acc, curr) => acc + curr.reçu, 0);
  const globalRate = totalCommanded > 0 ? (totalReceived / totalCommanded) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <ClipboardCheck className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Analyse des quantités</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Comparaison commandé vs reçu par BL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
             <TrendingUp className="size-3" />
             {globalRate.toFixed(1)}% reçu
           </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-white/5" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: 20, fontSize: 11, fontWeight: 600, color: "#64748b" }}
              />
              <Bar 
                name="Quantité Commandée" 
                dataKey="commandé" 
                fill="#cbd5e1" 
                radius={[6, 6, 0, 0]} 
                barSize={16} 
              />
              <Bar 
                name="Quantité Reçue" 
                dataKey="reçu" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={16} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
           <div className="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-4 border border-slate-100 dark:border-white/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-white/5 shadow-sm text-slate-400">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Commandé</p>
                <p className="text-xl font-black text-slate-700 dark:text-slate-200">{totalCommanded.toLocaleString()}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 p-4 border border-emerald-100/50 dark:border-emerald-500/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-white/5 shadow-sm text-emerald-500">
                <Package className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">Total Reçu</p>
                <p className="text-xl font-black text-emerald-600">{totalReceived.toLocaleString()}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
