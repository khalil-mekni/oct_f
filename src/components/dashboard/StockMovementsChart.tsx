// StockMovementsChart.tsx
"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useMemo, useState } from "react";
import { useStockMovementsStats } from "@/hooks/useStockMovementsStats";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
  Download,
  Scissors,
  Activity,
} from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StockMovementsChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("7d");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data, isLoading, isError } = useStockMovementsStats(period);
  const stats = data ?? [];

  const categories = stats.map((i) => i.label);
  const totalIns = stats.reduce((s, i) => s + i.in_count, 0);
  const totalOuts = stats.reduce((s, i) => s + i.out_count, 0);
  const totalTransfers = stats.reduce((s, i) => s + i.transfer_count, 0);
  const totalLosses = stats.reduce((s, i) => s + i.loss_count, 0);
  const totalSurplus = stats.reduce((s, i) => s + (i.surplus_count ?? 0), 0);
  
  const totalFlux = totalIns + totalOuts + totalLosses + totalSurplus;
  const totalMovements = totalIns + totalOuts + totalTransfers + totalLosses + totalSurplus;
  const balance = (totalIns + totalSurplus) - (totalOuts + totalLosses);

  const pct = (v: number, t: number, d = 0) =>
    t <= 0 ? "0" : ((v / t) * 100).toFixed(d);

  const COLORS = {
    teal: "#10B981", // Success/In
    rose: "#F43F5E", // Error/Out
    violet: "#8B5CF6", // Loss
    sky: "#0EA5E9", // Transfer
    amber: "#F59E0B", // Surplus/Split
  };

  const series = [
    { name: "Entrées",    data: stats.map((i) => i.in_count),          color: COLORS.teal   },
    { name: "Sorties",    data: stats.map((i) => i.out_count),         color: COLORS.rose   },
    { name: "Pertes",     data: stats.map((i) => i.loss_count),        color: COLORS.violet },
    { name: "Transferts", data: stats.map((i) => i.transfer_count),    color: COLORS.sky    },
    { name: "Surplus",    data: stats.map((i) => i.surplus_count),     color: COLORS.amber  },
  ];

  // ── Theme-aware ApexCharts options ────────────────────────────────────────
  const labelColor  = isDark ? "#94A3B8" : "#64748B";
  const gridColor   = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const tooltipTheme = isDark ? "dark" : "light";

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Inter, sans-serif",
        type: "area",
        height: 340,
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        animations: { enabled: true, easing: "easeinout", speed: 800 },
      },
      colors: [COLORS.teal, COLORS.rose, COLORS.violet, COLORS.sky, COLORS.amber],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2, lineCap: "round" },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.1,
          opacityFrom: isDark ? 0.4 : 0.25,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "11px", colors: labelColor, fontWeight: 500 } },
      },
      yaxis: {
        labels: { 
          style: { colors: labelColor, fontSize: "11px" },
          formatter: (v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toString()
        },
        min: 0,
      },
      legend: {
        show: false, 
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { left: 10, right: 10 },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: tooltipTheme,
        y: { formatter: (v: number) => `${v.toLocaleString()} unités` },
        style: { fontSize: "12px" },
      },
      markers: { size: 0, hover: { size: 5 } },
      theme: { mode: isDark ? "dark" : "light" },
    }),
    [categories, isDark, labelColor, gridColor, tooltipTheme]
  );

  // ── Stat card definitions ─────────────────────────────────────────────────
  const statCards = [
    {
      label: "Entrées",
      value: totalIns,
      sub: `${pct(totalIns, totalFlux)}% du flux`,
      Icon: ArrowUpCircle,
      TrendIcon: TrendingUp,
      cardCls: "border-emerald-100 bg-emerald-50/50 dark:border-emerald-500/10 dark:bg-emerald-500/5",
      textCls: "text-emerald-700 dark:text-emerald-400",
      subCls:  "text-emerald-600 dark:text-emerald-500",
    },
    {
      label: "Sorties",
      value: totalOuts,
      sub: `${pct(totalOuts, totalFlux)}% du flux`,
      Icon: ArrowDownCircle,
      TrendIcon: TrendingDown,
      cardCls: "border-rose-100 bg-rose-50/50 dark:border-rose-500/10 dark:bg-rose-500/5",
      textCls: "text-rose-700 dark:text-rose-400",
      subCls:  "text-rose-600 dark:text-rose-500",
    },
    {
      label: "Pertes",
      value: totalLosses,
      sub: `${pct(totalLosses, totalOuts, 1)}% ratio`,
      Icon: AlertCircle,
      TrendIcon: TrendingDown,
      cardCls: "border-violet-100 bg-violet-50/50 dark:border-violet-500/10 dark:bg-violet-500/5",
      textCls: "text-violet-700 dark:text-violet-400",
      subCls:  "text-violet-600 dark:text-violet-500",
    },
    {
      label: "Transferts",
      value: totalTransfers,
      sub: `${pct(totalTransfers, totalMovements, 1)}% activité`,
      Icon: RefreshCw,
      TrendIcon: Activity,
      cardCls: "border-sky-100 bg-sky-50/50 dark:border-sky-500/10 dark:bg-sky-500/5",
      textCls: "text-sky-700 dark:text-sky-400",
      subCls:  "text-sky-600 dark:text-sky-500",
    },
    {
      label: "Surplus",
      value: totalSurplus,
      sub: `Ajustements`,
      Icon: Scissors,
      TrendIcon: Activity,
      cardCls: "border-amber-100 bg-amber-50/50 dark:border-amber-500/10 dark:bg-amber-500/5",
      textCls: "text-amber-700 dark:text-amber-400",
      subCls:  "text-amber-600 dark:text-amber-500",
    },
  ];

  function toggleDropdown() { setIsOpen((v) => !v); }
  function closeDropdown() { setIsOpen(false); }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-44 rounded-xl bg-slate-100 dark:bg-white/10" />
              <div className="h-4 w-64 rounded-lg bg-slate-50 dark:bg-white/5" />
            </div>
            <div className="h-9 w-36 rounded-xl bg-slate-100 dark:bg-white/10" />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-50 dark:bg-white/5" />
            ))}
          </div>
          <div className="h-[340px] rounded-2xl bg-slate-50 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="rounded-3xl border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-950/30 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-sky-100 dark:bg-sky-500/10">
          <AlertCircle className="h-7 w-7 text-sky-500 dark:text-sky-400" />
        </div>
        <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
          Impossible de charger les statistiques
        </p>
        <p className="mt-1 text-xs text-sky-500/70">
          Vérifiez votre connexion et réessayez
        </p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-sm shadow-slate-100 dark:shadow-2xl">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-100/80 dark:bg-teal-600/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-sky-100/60 dark:bg-sky-600/8 blur-3xl" />

      {/* ── Header ── */}
      <div className="relative flex flex-col gap-4 border-b border-slate-100 dark:border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-500 shadow-lg shadow-teal-500/25">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
              Flux de Stock
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Suivi détaillé des mouvements et ajustements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period tabs */}
          <div className="flex gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1">
            {(["7d", "14d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  period === p
                    ? "bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-white/5"
                }`}
              >
                {p === "7d" ? "7 jours" : p === "14d" ? "14 jours" : "30 jours"}
              </button>
            ))}
          </div>

          {/* More menu */}
          <div className="relative inline-block">
            <button
              onClick={toggleDropdown}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <MoreDotIcon className="text-slate-400" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-48 p-2 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-white/10"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2.5 font-medium text-left text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2.5 text-sm transition-colors"
              >
                <Download className="h-4 w-4 text-teal-500" />
                Exporter les données
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2.5 font-medium text-left text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2.5 text-sm transition-colors"
              >
                <Calendar className="h-4 w-4 text-sky-500" />
                Personnaliser la période
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="relative space-y-6 p-6">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map(({ label, value, sub, Icon, TrendIcon, cardCls, textCls, subCls }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl border p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${cardCls}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
                  {label}
                </span>
                <Icon className={`size-4 ${textCls} group-hover:scale-110 transition-transform`} />
              </div>
              <p className={`text-2xl font-black tabular-nums ${textCls}`}>{value.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon className={`h-3 w-3 ${subCls}`} />
                <span className={`text-[10px] font-semibold ${subCls}`}>{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Balance strip ── */}
        <div className={`relative overflow-hidden rounded-2xl border p-4 ${
          balance >= 0
            ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/50"
            : "border-red-200 dark:border-rose-500/20 bg-red-50 dark:bg-rose-950/50"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {balance >= 0
                ? <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                : <TrendingDown className="h-5 w-5 text-red-600 dark:text-rose-400" />
              }
              <div>
                <p className={`text-sm font-bold ${
                  balance >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-red-700 dark:text-rose-400"
                }`}>
                  Solde net de la période
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {balance >= 0 ? "Flux entrant positif" : "Flux sortant dominant"}
                </p>
              </div>
            </div>
            <p className={`text-3xl font-black tabular-nums ${
              balance >= 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-rose-400"
            }`}>
              {balance >= 0 ? "+" : ""}{balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/50 dark:bg-white/[0.02] p-4">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <ReactApexChart options={options} series={series} type="area" height={340} />
            </div>
          </div>
        </div>

        {/* ── Footer legend ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/8 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {[
              { color: "bg-emerald-500", label: "Entrées" },
              { color: "bg-rose-500",    label: "Sorties" },
              { color: "bg-violet-500",  label: "Pertes" },
              { color: "bg-sky-500",     label: "Transferts" },
              { color: "bg-amber-500",   label: "Surplus" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <RefreshCw className="h-3 w-3 animate-spin-slow" />
            Temps Réel
          </div>
        </div>
      </div>
    </div>
  );
}
