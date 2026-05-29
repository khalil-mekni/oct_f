"use client";

import { useContractsWidget } from "@/hooks/useContractsWidget";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, CartesianGrid, ReferenceLine 
} from "recharts";
import { FileText, Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { format, differenceInDays, startOfMonth, endOfMonth, addMonths, isWithinInterval, parseISO } from "date-fns";
import { fr } from "date-fns/locale";


function getStatusInfo(status: string) {
  switch (status?.toLowerCase()) {
    case "active": case "actif": 
      return { color: "#6366f1", label: "Actif", bg: "bg-indigo-500/10", text: "text-indigo-600" };
    case "expired": case "expiré": 
      return { color: "#f43f5e", label: "Expiré", bg: "bg-rose-500/10", text: "text-rose-600" };
    case "expiring_soon": case "expirant": 
      return { color: "#f59e0b", label: "Expirant", bg: "bg-amber-500/10", text: "text-amber-600" };
    default: 
      return { color: "#94a3b8", label: status, bg: "bg-slate-500/10", text: "text-slate-600" };
  }
}

/* ─── Main ─────────────────────────────────────────────────── */

export default function ContractsTimelineWidget() {
  const { data, isLoading, isError, error } = useContractsWidget();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse h-[450px]">
        <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-white/10 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-50 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/30 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-10 text-rose-400" />
        <p className="font-bold text-rose-700 dark:text-rose-400">Erreur de chargement</p>
      </div>
    );
  }

  // Preparation des données pour le Gantt
  // On se concentre sur une fenêtre de temps (ex: 6 mois autour d'aujourd'hui)
  const today = new Date();
  const rangeStart = startOfMonth(addMonths(today, -1));
  const rangeEnd = endOfMonth(addMonths(today, 4));
  const totalDaysInRange = differenceInDays(rangeEnd, rangeStart);

  const ganttData = data.recentContracts
    .filter(c => c.startDate || c.endDate)
    .map(c => {
      const start = c.startDate ? parseISO(c.startDate) : rangeStart;
      const end = c.endDate ? parseISO(c.endDate) : rangeEnd;
      
      // On clampe les dates pour l'affichage
      const displayStart = start < rangeStart ? rangeStart : start;
      const displayEnd = end > rangeEnd ? rangeEnd : end;
      
      const startOffset = differenceInDays(displayStart, rangeStart);
      const duration = Math.max(1, differenceInDays(displayEnd, displayStart));
      
      const statusInfo = getStatusInfo(c.status);

      return {
        id: c.id,
        name: c.reference,
        partner: c.partnerName || "Inconnu",
        startOffset,
        duration,
        fullRange: [startOffset, startOffset + duration],
        status: c.status,
        statusLabel: statusInfo.label,
        color: statusInfo.color,
        startDate: start,
        endDate: end
      };
    })
    .slice(0, 8);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3 shadow-xl text-xs">
          <p className="font-bold text-slate-800 dark:text-white mb-1">{item.name}</p>
          <p className="text-slate-500 dark:text-slate-400 mb-2">{item.partner}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Début:</span>
              <span className="font-semibold">{format(item.startDate, "dd MMM yyyy", { locale: fr })}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Fin:</span>
              <span className="font-semibold">{format(item.endDate, "dd MMM yyyy", { locale: fr })}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Statut:</span>
              <span className="font-bold" style={{ color: item.color }}>{item.statusLabel}</span>
            </p>
          </div>
        </div>
      );
    };
    return null;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Calendar className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Timeline des contrats</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Vue Gantt des échéances contractuelles</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-500">
             <Clock className="size-3" />
             {format(rangeStart, "MMM", { locale: fr })} - {format(rangeEnd, "MMM yyyy", { locale: fr })}
           </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6 grid grid-cols-4 gap-3">
          <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 p-4 border border-indigo-100 dark:border-indigo-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/70">Actifs</p>
            <p className="text-2xl font-black text-indigo-600">{data.activeContracts}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-4 border border-amber-100 dark:border-amber-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70">Expirant</p>
            <p className="text-2xl font-black text-amber-600">{data.expiringSoon}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-4 border border-rose-100 dark:border-rose-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600/70">Alertes</p>
            <p className="text-2xl font-black text-rose-600">{data.contractAlerts}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 border border-slate-100 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{data.totalContracts}</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ganttData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-white/5" />
              <XAxis 
                type="number" 
                domain={[0, totalDaysInRange]} 
                hide 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                tick={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                className="text-slate-500"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              
              {/* Aujourd'hui */}
              <ReferenceLine 
                x={differenceInDays(today, rangeStart)} 
                stroke="#f43f5e" 
                strokeDasharray="3 3"
                label={{ value: 'Auj.', position: 'top', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} 
              />

              {/* Barre transparente pour décalage */}
              <Bar dataKey="startOffset" stackId="a" fill="transparent" />
              {/* Barre de durée */}
              <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]} barSize={20}>
                {ganttData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 border-t border-slate-100 dark:border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-medium text-slate-500">Actif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-medium text-slate-500">Expirant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-medium text-slate-500">Expiré</span>
          </div>
        </div>
      </div>
    </div>
  );
}
