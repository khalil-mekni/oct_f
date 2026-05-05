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
  const totalSplits = stats.reduce((s, i) => s + (i.split_count ?? 0), 0);
  const totalFlux = totalIns + totalOuts;
  const totalMovements = totalIns + totalOuts + totalTransfers + totalLosses + totalSplits;
  const balance = totalIns - totalOuts;

  const pct = (v: number, t: number, d = 0) =>
    t <= 0 ? "0" : ((v / t) * 100).toFixed(d);

  const COLORS = {
    teal: "#14B8A6",
    sky: "#0EA5E9",
    rose: "#F43F5E",
    violet: "#8B5CF6",
    amber: "#F59E0B",
  };

  const series = [
    { name: "Entrées",    data: stats.map((i) => i.in_count),          color: COLORS.teal   },
    { name: "Sorties",    data: stats.map((i) => i.out_count),         color: COLORS.rose   },
    { name: "Transferts", data: stats.map((i) => i.transfer_count),    color: COLORS.sky    },
    { name: "Pertes",     data: stats.map((i) => i.loss_count),        color: COLORS.violet },
    { name: "Splits",     data: stats.map((i) => i.split_count ?? 0),  color: COLORS.amber  },
  ];

  // ── Theme-aware ApexCharts options ────────────────────────────────────────
  const labelColor  = isDark ? "#64748B" : "#94A3B8";
  const gridColor   = isDark ? "#1E293B" : "#F1F5F9";
  const tooltipTheme = isDark ? "dark" : "light";

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "DM Sans, sans-serif",
        type: "area",
        height: 340,
        stacked: true,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        animations: { enabled: true, easing: "easeinout", speed: 900 },
      },
      colors: [COLORS.teal, COLORS.rose, COLORS.sky, COLORS.violet, COLORS.amber],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.15,
          opacityFrom: isDark ? 0.45 : 0.3,
          opacityTo: 0.02,
          stops: [0, 85, 100],
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "11px", colors: labelColor, fontWeight: 500 } },
      },
      yaxis: {
        title: {
          text: "Mouvements",
          style: { fontSize: "11px", color: labelColor, fontWeight: 500 },
        },
        labels: { style: { colors: labelColor, fontSize: "11px" } },
        min: 0,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "DM Sans",
        fontSize: "12px",
        fontWeight: 500,
        labels: { colors: isDark ? "#94A3B8" : "#475569" },
        markers: { shape: "circle", radius: 5 },
        itemMargin: { horizontal: 14, vertical: 4 },
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        position: "back",
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: tooltipTheme,
        y: { formatter: (v: number) => `${v} mvt` },
        style: { fontSize: "12px", fontFamily: "DM Sans, sans-serif" },
      },
      markers: { size: 3, strokeWidth: 0, hover: { size: 6 } },
      theme: { mode: isDark ? "dark" : "light" },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories, isDark]
  );

  // ── Stat card definitions ─────────────────────────────────────────────────
  const statCards = [
    {
      label: "Entrées",
      value: totalIns,
      sub: `${pct(totalIns, totalFlux)}% du flux`,
      Icon: ArrowUpCircle,
      TrendIcon: TrendingUp,
      // light / dark classes
      cardCls: "border-teal-200 bg-teal-50 dark:border-teal-500/20 dark:bg-gradient-to-br dark:from-teal-950/80 dark:to-teal-900/30",
      textCls: "text-teal-700 dark:text-teal-400",
      subCls:  "text-teal-600 dark:text-teal-500",
    },
    {
      label: "Sorties",
      value: totalOuts,
      sub: `${pct(totalOuts, totalFlux)}% du flux`,
      Icon: ArrowDownCircle,
      TrendIcon: TrendingDown,
      cardCls: "border-red-200 bg-red-50 dark:border-rose-500/20 dark:bg-gradient-to-br dark:from-rose-950/80 dark:to-rose-900/30",
      textCls: "text-red-700 dark:text-rose-400",
      subCls:  "text-red-600 dark:text-rose-500",
    },
    {
      label: "Transferts",
      value: totalTransfers,
      sub: `${pct(totalTransfers, totalMovements, 1)}% total`,
      Icon: RefreshCw,
      TrendIcon: Activity,
      cardCls: "border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-gradient-to-br dark:from-sky-950/80 dark:to-sky-900/30",
      textCls: "text-sky-700 dark:text-sky-400",
      subCls:  "text-sky-600 dark:text-sky-500",
    },
    {
      label: "Pertes",
      value: totalLosses,
      sub: `${pct(totalLosses, totalOuts, 1)}% sorties`,
      Icon: AlertCircle,
      TrendIcon: TrendingDown,
      cardCls: "border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-gradient-to-br dark:from-violet-950/80 dark:to-violet-900/30",
      textCls: "text-violet-700 dark:text-violet-400",
      subCls:  "text-violet-600 dark:text-violet-500",
    },
    {
      label: "Splits",
      value: totalSplits,
      sub: `${pct(totalSplits, totalMovements, 1)}% total`,
      Icon: Scissors,
      TrendIcon: Activity,
      cardCls: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-gradient-to-br dark:from-amber-950/80 dark:to-amber-900/30",
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
              Activité des mouvements
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Entrées · Sorties · Transferts · Pertes · Splits
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
              <p className={`text-2xl font-black tabular-nums ${textCls}`}>{value}</p>
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
              {balance >= 0 ? "+" : ""}{balance}
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
              { color: "bg-teal-500",   label: "Entrées"    },
              { color: "bg-rose-500",   label: "Sorties"    },
              { color: "bg-sky-500",    label: "Transferts" },
              { color: "bg-violet-500", label: "Pertes"     },
              { color: "bg-amber-500",  label: "Splits"     },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <RefreshCw className="h-3 w-3" />
            Mise à jour automatique
          </div>
        </div>
      </div>
    </div>
  );
}