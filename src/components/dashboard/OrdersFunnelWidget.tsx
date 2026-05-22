"use client";

import { useOrdersWidget } from "@/hooks/useOrdersWidget";
import {
  ShoppingCart,
  Clock,
  CircleCheck,
  Package,
  Truck,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

const COLORS = {
  pending: {
    bg: "from-amber-50 to-amber-100/50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    bar: "bg-amber-500",
    gradient: "from-amber-500 to-amber-600",
  },
  validated: {
    bg: "from-emerald-50 to-emerald-100/50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    bar: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
  },
  partial: {
    bg: "from-blue-50 to-blue-100/50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    bar: "bg-blue-500",
    gradient: "from-blue-500 to-indigo-600",
  },
  received: {
    bg: "from-violet-50 to-violet-100/50",
    border: "border-violet-200",
    iconBg: "bg-violet-100",
    icon: "text-violet-600",
    bar: "bg-violet-500",
    gradient: "from-violet-500 to-purple-600",
  },
};

function StageCard({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  color: keyof typeof COLORS;
  icon: React.ElementType;
}) {
  const c = COLORS[color];
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`size-5 ${c.icon}`} />
        </div>
        <p className="text-3xl font-black tracking-tight text-slate-800 dark:text-white tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
          {label}
        </p>
        
        <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden bg-white/60 dark:bg-black/20 backdrop-blur-sm">
          <div
            className={`h-full rounded-full ${c.bar} transition-all duration-1000 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500">
          {pct}% DU FLUX
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group rounded-xl bg-white dark:bg-white/[0.03] p-4 border border-slate-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:border-slate-200 dark:hover:border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-xl font-black mt-1 tabular-nums" style={{ color }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] font-medium text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 transition-transform group-hover:rotate-12">
          <Icon className="size-4" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function OrdersFunnelWidget() {
  const { data, isLoading, isError } = useOrdersWidget();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse h-[400px]">
        <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-white/10 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
           {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-50 dark:bg-white/5" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
           {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-50 dark:bg-white/5" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-10 text-rose-500" />
        <p className="font-bold text-rose-700 dark:text-rose-400">Erreur de chargement des commandes</p>
      </div>
    );
  }

  const completionRate = data.total > 0
    ? ((data.received_count / data.total) * 100).toFixed(1)
    : "0.0";
  
  const validationRate = data.total > 0
    ? ((data.validated_count / data.total) * 100).toFixed(1)
    : "0.0";
  
  const partialRate = data.total > 0
    ? ((data.partiallyReceived / data.total) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-100 dark:border-white/8 px-6 py-5">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
              <ShoppingCart className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
                Workflow des commandes
              </h3>
              <p className="text-xs text-slate-400">
                Suivi opérationnel de l&apos;entonnoir de traitement
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {data.total.toLocaleString()} TOTAL
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Stages Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StageCard 
            label="En attente" 
            value={data.pending} 
            total={data.total} 
            color="pending" 
            icon={Clock}
          />
          <StageCard 
            label="Validée" 
            value={data.validated_count} 
            total={data.total} 
            color="validated" 
            icon={CircleCheck}
          />
          <StageCard 
            label="Partielle" 
            value={data.partiallyReceived} 
            total={data.total} 
            color="partial" 
            icon={Package}
          />
          <StageCard 
            label="Réceptionnée" 
            value={data.received_count} 
            total={data.total} 
            color="received" 
            icon={Truck}
          />
        </div>

        {/* Analytical Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard 
            label="Taux de validation" 
            value={`${validationRate}%`}
            subtitle="Commandes prêtes"
            color="#10B981" 
            icon={TrendingUp}
          />
          <MetricCard 
            label="Réceptions partielles" 
            value={`${partialRate}%`}
            subtitle="En cours de livraison"
            color="#3B82F6" 
            icon={Package}
          />
          <MetricCard 
            label="Retards Détectés" 
            value={data.late.toString()}
            subtitle="Alertes logistiques"
            color="#F43F5E" 
            icon={AlertCircle}
          />
        </div>

        {/* Global Progress */}
        <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.02] p-5 border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progression Globale</p>
              <h4 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
                {data.received_count} / {data.total} <span className="text-xs font-medium text-slate-400 ml-1 italic">commandes terminées</span>
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">
                {Math.round((data.received_count / data.total) * 100) || 0}%
              </span>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500/20"
              style={{ width: `${(data.received_count / data.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
