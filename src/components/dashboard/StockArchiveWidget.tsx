"use client";

import {
  Archive,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useStockArchiveSummary } from "@/hooks/useStockArchiveSummary";

function fmt(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value ?? 0));
}

export default function StockArchiveWidget() {
  const { data, isLoading, isError } = useStockArchiveSummary();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-white/10" />
          <div className="h-32 rounded-2xl bg-slate-50 dark:bg-white/5" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-xl bg-slate-50 dark:bg-white/5" />
            <div className="h-24 rounded-xl bg-slate-50 dark:bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-950/30 p-5 text-sm text-red-600 dark:text-red-400">
        Impossible de charger l&apos;historique du stock.
      </div>
    );
  }

  const isPositive = data.balance >= 0;
  const maxVal = Math.max(...data.days.map((d) => Math.max(d.entree, d.sortie, 1)));

  const status = data.balance < 0
    ? {
        label: "Stock en diminution",
        message: "Les sorties dépassent les entrées",
        colorText: "text-red-600 dark:text-rose-400",
        cardBg: "bg-red-50 border-red-200 dark:bg-rose-950/50 dark:border-rose-500/20",
        icon: AlertTriangle,
      }
    : {
        label: "Stock stable",
        message: "Les entrées couvrent les sorties",
        colorText: "text-emerald-600 dark:text-emerald-400",
        cardBg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-500/20",
        icon: CheckCircle,
      };

  const StatusIcon = status.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-sm shadow-slate-100 dark:shadow-2xl">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-100/80 dark:bg-violet-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-indigo-100/60 dark:bg-indigo-600/10 blur-3xl" />

      {/* ── Header ── */}
      <div className="relative flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
            <Archive className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
              Archive du stock
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Mouvements sur les 7 derniers jours
            </p>
          </div>
        </div>
        {/* Live badge */}
        <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">Live</span>
        </div>
      </div>

      <div className="relative space-y-5 p-6">
        {/* ── Status card ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 ${status.cardBg}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <StatusIcon className={`size-5 ${status.colorText}`} />
                <p className={`text-sm font-bold ${status.colorText}`}>{status.label}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{status.message}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                Balance 7j
              </p>
              <p className={`mt-1 text-4xl font-black tabular-nums ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-rose-400"
              }`}>
                {isPositive ? "+" : ""}{fmt(data.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* ── IN / OUT ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Entrées */}
          <div className="group rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/60 dark:to-emerald-900/20 p-4 transition-all hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <ArrowUpRight className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Entrées
              </span>
            </div>
            <p className="text-3xl font-black tabular-nums text-emerald-700 dark:text-emerald-400">
              {fmt(data.total_in)}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Aujourd&apos;hui :{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-500">
                {fmt(data.today_in)}
              </span>
            </p>
          </div>

          {/* Sorties */}
          <div className="group rounded-2xl border border-red-200 dark:border-rose-500/20 bg-red-50 dark:bg-gradient-to-br dark:from-rose-950/60 dark:to-rose-900/20 p-4 transition-all hover:shadow-md hover:shadow-red-100 dark:hover:shadow-rose-500/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 dark:bg-rose-500/20">
                <ArrowDownRight className="size-4 text-red-600 dark:text-rose-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-rose-400">
                Sorties
              </span>
            </div>
            <p className="text-3xl font-black tabular-nums text-red-700 dark:text-rose-400">
              {fmt(data.total_out)}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              Aujourd&apos;hui :{" "}
              <span className="font-bold text-red-600 dark:text-rose-500">
                {fmt(data.today_out)}
              </span>
            </p>
          </div>
        </div>

        {/* ── 7-day bars ── */}
        <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.03] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-slate-400" />
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Évolution 7 jours
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Entrées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 dark:bg-rose-500" /> Sorties
              </span>
            </div>
          </div>

          <div className="space-y-3.5">
            {data.days.map((day) => {
              const inW = (day.entree / maxVal) * 100;
              const outW = (day.sortie / maxVal) * 100;
              const bal = day.entree - day.sortie;
              return (
                <div key={day.date} className="group">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      {day.date}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-600">
                        ↑{fmt(day.entree)} ↓{fmt(day.sortie)}
                      </span>
                      <span className={`font-bold text-[10px] ${
                        bal >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-rose-400"
                      }`}>
                        {bal >= 0 ? "+" : ""}{fmt(bal)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                        style={{ width: `${inW}%` }}
                      />
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-red-100 dark:bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 dark:from-rose-600 to-red-400 dark:to-rose-400 transition-all duration-700"
                        style={{ width: `${outW}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}