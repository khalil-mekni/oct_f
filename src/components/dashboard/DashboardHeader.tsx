"use client";

import Link from "next/link";
import { BellRing, Building2, ArrowRightLeft, LayoutDashboard, TrendingUp, Package, FileText, Truck } from "lucide-react";

/* Accent KPI pill at the top — mimics the big number cards in the reference */
function AccentKpi({
  label, value, unit, color, icon: Icon,
}: {
  label: string; value: string; unit?: string;
  color: string; // gradient classes
  icon: React.ElementType;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl ${color} px-5 py-3.5 shadow-lg`}>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black tabular-nums text-white">{value}</span>
          {unit && <span className="text-xs font-semibold text-white/60">{unit}</span>}
        </div>
      </div>
      <Icon className="ml-auto size-7 text-white/40" />
    </div>
  );
}

export default function DashboardHeader() {
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/30">
            <LayoutDashboard className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
              Smart Packaging Logistics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cockpit logistique · supervision entrepôts, stocks &amp; alertes
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Opérationnel
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <BellRing className="size-3.5" />
            Alertes
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">3</span>
          </Link>
          <Link
            href="/entrepots"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <Building2 className="size-3.5" />
            Entrepôts
          </Link>
          <Link
            href="/mouvements"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-violet-700 hover:to-indigo-700 transition-all"
          >
            <ArrowRightLeft className="size-3.5" />
            Mouvements
          </Link>
        </div>
      </div>

      {/* Accent KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AccentKpi label="Taux de complétion" value="87" unit="%" color="bg-gradient-to-br from-violet-500 to-purple-600" icon={TrendingUp} />
        <AccentKpi label="Stock en transit"    value="124" unit="unités" color="bg-gradient-to-br from-cyan-500 to-blue-600" icon={Package} />
        <AccentKpi label="Contrats actifs"     value="38" unit="contrats" color="bg-gradient-to-br from-pink-500 to-rose-600" icon={FileText} />
        <AccentKpi label="BL en attente"       value="12" unit="bons" color="bg-gradient-to-br from-amber-500 to-orange-600" icon={Truck} />
      </div>
    </div>
  );
}