"use client";

import { useDeliveryNotesWidget } from "@/hooks/useDeliveryNotesWidget";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { 
  AlertCircle, 
  Package, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { motion } from "framer-motion";

/* ─── Mock Data for Sparklines (since real history isn't available per KPI) ─── */
const sparkData = [
  { v: 40 }, { v: 60 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 80 }, { v: 65 }
];

/* ─── Custom Tooltip ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 shadow-xl text-xs">
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
        </div>
      </div>
    );
  }
  return null;
};

/* ─── KPI Card Component with Sparkline ────────────────────── */
const KPICard = ({ title, value, icon: Icon, color, delay, trend }: any) => {
  const colorVariants: any = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 stroke-blue-500 stop-blue-500",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 stroke-emerald-500 stop-emerald-500",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 stroke-amber-500 stop-amber-500",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 stroke-rose-500 stop-rose-500",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 stroke-violet-500 stop-violet-500",
  };

  const currentVariant = colorVariants[color];
  const strokeColor = currentVariant.split(' ').find((s: string) => s.startsWith('stroke-'))?.replace('stroke-', '#').replace('blue-500', '3b82f6').replace('emerald-500', '10b981').replace('amber-500', 'f59e0b').replace('rose-500', 'f43f5e').replace('violet-500', '8b5cf6') || '#6366f1';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-4 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-white/10"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${currentVariant} shadow-sm`}>
          <Icon className="size-5" />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-[10px] font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <TrendingUp className={`size-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
           </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
        <h4 className="mt-1 text-2xl font-black text-slate-800 dark:text-white">{value.toLocaleString()}</h4>
      </div>

      {/* Mini Sparkline */}
      <div className="mt-4 h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="v" 
              stroke={strokeColor} 
              strokeWidth={2} 
              fill={`url(#grad-${color})`} 
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

/* ─── Main Component ───────────────────────────────────────── */
export default function DeliveryQuantitiesWidget() {
  const { data, isLoading, isError } = useDeliveryNotesWidget();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
        <div className="h-[400px] animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/20 dark:bg-rose-500/5">
        <AlertCircle className="mb-2 size-10 text-rose-500" />
        <p className="font-bold text-rose-700 dark:text-rose-400">Impossible de charger les données logistiques</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-rose-600 active:scale-95"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const chartData = data.recentDeliveryNotes
    .map(n => ({
      name: n.numero_bl,
      commandé: n.quantite_commandee || 0,
      reçu: n.quantite_recue || 0,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KPICard 
          title="Total Bons" 
          value={data.total} 
          icon={FileText} 
          color="blue" 
          delay={0.1}
          trend={12}
        />
        <KPICard 
          title="Bons Validés" 
          value={data.validated} 
          icon={CheckCircle2} 
          color="emerald" 
          delay={0.2}
          trend={8}
        />
        <KPICard 
          title="En Attente" 
          value={data.pending} 
          icon={Clock} 
          color="amber" 
          delay={0.3}
          trend={-5}
        />
        <KPICard 
          title="En Retard" 
          value={data.late} 
          icon={AlertTriangle} 
          color="rose" 
          delay={0.4}
          trend={2}
        />
        <KPICard 
          title="Quantité Reçue" 
          value={data.totalQuantityReceived} 
          icon={Package} 
          color="violet" 
          delay={0.5}
          trend={15}
        />
      </div>

      {/* Main Chart Section */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-lg">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">Réceptions & Livraisons</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Flux comparatif des derniers bons de livraison</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 mr-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span className="text-[11px] font-bold text-slate-500">Commandé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-[11px] font-bold text-slate-500">Reçu</span>
              </div>
            </div>
            <div className="hidden rounded-full bg-slate-50 dark:bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 dark:border-white/5 sm:block">
              {chartData.length} Derniers BL
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReçuMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-white/5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  name="Quantité Reçue"
                  dataKey="reçu" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorReçuMain)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  name="Quantité Commandée"
                  dataKey="commandé" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}