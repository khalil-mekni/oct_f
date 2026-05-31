"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import {
  Building2,
  MapPin,
  Package,
  Boxes,
  Archive,
  AlertTriangle,
  ChevronRight,
  PieChart,
  Gauge,
} from "lucide-react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useWarehousesDetailed } from "@/hooks/useWarehousesDetailed";
import type { WarehouseDetailedItem } from "@/types/dashboard.types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ── Level styles — light & dark ───────────────────────────────────────────
function levelStyles(level: WarehouseDetailedItem["level"]) {
  if (level === "critical") {
    return {
      badgeCls: "border border-red-300 dark:border-red-500/30 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
      iconCls: "border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
      progress: "#EF4444",
      progressGlow: "rgba(239,68,68,0.35)",
      text: "Critique",
    };
  }
  if (level === "warning") {
    return {
      badgeCls: "border border-amber-300 dark:border-amber-500/30 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
      iconCls: "border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
      progress: "#F59E0B",
      progressGlow: "rgba(245,158,11,0.35)",
      text: "Avertissement",
    };
  }
  return {
    badgeCls: "border border-emerald-300 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    iconCls: "border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    progress: "#10B981",
    progressGlow: "rgba(16,185,129,0.35)",
    text: "Normal",
  };
}

const DONUT_COLORS = [
  "#E6194B", // Red
  "#3CB44B", // Green
  "#FFE119", // Yellow
  "#4363D8", // Blue
  "#F58231", // Orange
  "#911EB4", // Purple
  "#42D4F4", // Cyan
  "#F032E6", // Magenta
  "#BDB76B", // Dark Khaki
  "#FABEBE", // Pink
  "#008080", // Teal
  "#E6BEFF", // Lavender
  "#9A6324", // Brown
  "#FFFAC8", // Beige
  "#800000", // Maroon
  "#AAFFC3", // Mint
  "#808000", // Olive
];

export default function WarehouseOccupancyInteractive() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { data, isLoading, isError, error } = useWarehousesDetailed();
  const warehouses = data ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId && warehouses.length > 0) setActiveId(warehouses[0].id);
  }, [warehouses, activeId]);

  const active = warehouses.find((w) => w.id === activeId) ?? warehouses[0] ?? null;

  // Show all warehouses without grouping
  const donutData = useMemo(() => {
    const cats = warehouses.map((w) => w.nom);
    const rates = warehouses.map((w) => w.fillRate);
    const ids = warehouses.map((w) => w.id);
    
    return { 
      cats, 
      rates, 
      ids, 
      colors: DONUT_COLORS.length >= cats.length 
        ? DONUT_COLORS.slice(0, cats.length) 
        : [...DONUT_COLORS, ...Array(cats.length - DONUT_COLORS.length).fill("#CBD5E1")] 
    };
  }, [warehouses]);

  const avgFill =
    warehouses.length > 0
      ? warehouses.reduce((s, w) => s + w.fillRate, 0) / warehouses.length
      : 0;

  // ── ApexCharts options — theme-aware ──────────────────────────────────────
  const donutOptions: ApexOptions = useMemo(
    () => ({
      colors: donutData.colors,
      chart: {
        type: "donut",
        height: 650,
        toolbar: { show: false },
        background: "transparent",
        events: {
          dataPointSelection: (_e, _c, cfg) => {
            const id = donutData.ids[cfg.dataPointIndex];
            if (id) setActiveId(id);
          },
          dataPointMouseEnter: (_e, _c, cfg) => {
            const id = donutData.ids[cfg.dataPointIndex];
            if (id) setActiveId(id);
          },
        },
      },
      labels: donutData.cats,
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Moyenne",
                fontSize: "12px",
                fontWeight: 600,
                color: isDark ? "#94A3B8" : "#64748B",
                formatter: () => `${avgFill.toFixed(1)}%`,
              },
              value: {
                color: isDark ? "#F8FAFC" : "#0F172A",
                fontSize: "24px",
                fontWeight: 800,
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { fontSize: "10px", fontWeight: 700 },
        dropShadow: { enabled: false }
      },
      legend: {
        show: true,
        position: "bottom",
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        labels: { colors: isDark ? "#CBD5E1" : "#334155" },
        markers: { size: 6, strokeWidth: 0, shape: "circle" },
        itemMargin: { horizontal: 10, vertical: 6 },
        formatter: (name, opts) => {
           const rate = donutData.rates[opts.seriesIndex];
           const cleanName = name.replace(/entrep[oô]t\s+/gi, "");
           return `${cleanName} (${rate.toFixed(0)}%)`;
        }
      },
      tooltip: {
        custom: ({ seriesIndex }) => {
          const name = donutData.cats[seriesIndex];
          const rate = donutData.rates[seriesIndex];
          const bg    = isDark ? "#1E293B" : "#FFFFFF";
          const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
          const text = isDark ? "#F1F5F9" : "#1E293B";
          const color = donutData.colors[seriesIndex];
          return `
            <div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:10px 14px;box-shadow:0 10px 20px -5px rgba(0,0,0,0.15);">
              <div style="font-weight:700;color:${color};margin-bottom:4px;font-size:13px;">${name}</div>
              <div style="font-size:12px;color:${text};font-weight:600;">Occupation: ${rate.toFixed(1)}%</div>
            </div>`;
        },
      },
      stroke: { show: true, width: 2, colors: [isDark ? "#0F172A" : "#FFFFFF"] },
      theme: { mode: isDark ? "dark" : "light" },
    }),
    [donutData, avgFill, isDark]
  );

  function toggleDropdown() { setIsOpen(!isOpen); }
  function closeDropdown() { setIsOpen(false); }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 animate-pulse">
          <div className="xl:col-span-7 h-[520px] rounded-2xl bg-slate-100 dark:bg-white/5" />
          <div className="xl:col-span-5 h-[520px] rounded-2xl bg-slate-100 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/30 p-5 text-sm text-red-600 dark:text-red-400">
        Erreur entrepôts : {error instanceof Error ? error.message : "Erreur inconnue"}
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 text-sm text-slate-500">
        Aucun entrepôt disponible.
      </div>
    );
  }

  const styles = levelStyles(active.level);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 shadow-sm shadow-slate-100 dark:shadow-2xl">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/70 dark:bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-violet-100/50 dark:bg-violet-600/8 blur-3xl" />

      {/* ── Header ── */}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-white/8 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
            <Gauge className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
              État des Entrepôts
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Survole ou clique sur une section pour voir le détail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-white">{warehouses.length}</span> entrepôt(s) ·{" "}
            Moy.{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">{avgFill.toFixed(1)}%</span>
          </div>
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
              className="w-44 p-2 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-white/10"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2 font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2.5 text-sm"
              >
                Voir détails
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2 font-medium text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2.5 text-sm"
              >
                Actualiser
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* ── Donut chart ── */}
          <div className="xl:col-span-7 rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/50 dark:bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PieChart className="size-5 text-blue-500 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-white">
                  Répartition par entrepôt
                </h4>
              </div>
            </div>

            <ReactApexChart
              options={donutOptions}
              series={donutData.rates}
              type="donut"
              height={650}
            />

            {/* Summary stats */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {[
                {
                  label: "Max",
                  value: `${Math.max(...warehouses.map((w) => w.fillRate)).toFixed(1)}%`,
                  cls: "text-red-600 dark:text-red-400",
                },
                {
                  label: "Min",
                  value: `${Math.min(...warehouses.map((w) => w.fillRate)).toFixed(1)}%`,
                  cls: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Stock",
                  value: warehouses.reduce((s, w) => s + w.stock_existant, 0).toLocaleString(),
                  cls: "text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Capacité",
                  value: warehouses.reduce((s, w) => s + w.capacite_totale, 0).toLocaleString(),
                  cls: "text-violet-600 dark:text-violet-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] p-3 text-center shadow-sm dark:shadow-none"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  <p className={`mt-1 text-sm font-bold ${stat.cls}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Detail panel ── */}
          <div className="xl:col-span-5">
            <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50/50 dark:bg-white/[0.02] p-5 h-full">

              {/* Warehouse title */}
              <div className="mb-5 flex items-start gap-4">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-md ${styles.iconCls}`}>
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-800 dark:text-white truncate">
                      {active.nom}
                    </h4>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${styles.badgeCls}`}>
                      {styles.text}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="size-3 flex-shrink-0" />
                    <span className="truncate">{active.adresse || "Adresse non renseignée"}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Occupation</p>
                  <p className="mt-0.5 text-2xl font-black text-slate-800 dark:text-white">
                    {active.fillRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Capacité utilisée</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {active.stock_existant.toLocaleString()} / {active.capacite_totale.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(active.fillRate, 100)}%`,
                      backgroundColor: styles.progress,
                      boxShadow: `0 0 10px ${styles.progressGlow}`,
                    }}
                  />
                </div>
              </div>

              {/* KPI row */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Stock actuel",  value: active.stock_existant.toLocaleString(),    cls: "text-blue-600 dark:text-blue-400"   },
                  { label: "Disponible",    value: active.capacite_disponible.toLocaleString(), cls: "text-emerald-600 dark:text-emerald-400" },
                  { label: "Lots",          value: active.entrepotLots.length,                 cls: "text-violet-600 dark:text-violet-400" },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.03] p-3 text-center shadow-sm dark:shadow-none"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">{kpi.label}</p>
                    <p className={`mt-1 text-base font-bold ${kpi.cls}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Lots list */}
              <div className="mb-4">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lots disponibles
                  </h5>
                  <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {active.entrepotLots.length}
                  </span>
                </div>

                <div className="max-h-[200px] space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                  {active.entrepotLots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/10 p-4 text-center text-sm text-slate-400">
                      Aucun lot disponible
                    </div>
                  ) : (
                    active.entrepotLots.map((item) => (
                      <div
                        key={item.id}
                        className="group rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-3 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-sm dark:hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Archive className="size-3.5 flex-shrink-0 text-slate-400" />
                              <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {item.lot?.code_lot ?? "Lot inconnu"}
                              </p>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                              <Package className="size-3" />
                              <span>{item.emballage?.name ?? "—"}</span>
                              {item.emballage?.code && (
                                <>
                                  <span>·</span>
                                  <span>{item.emballage.code}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Qté</p>
                            <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-white">
                              <Boxes className="size-3.5 text-slate-400" />
                              {item.quantite}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Critical alert */}
              {active.level === "critical" && (
                <div className="mb-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-950/30 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 size-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Seuil critique dépassé. Un transfert ou une réorganisation du stock est recommandé.
                    </p>
                  </div>
                </div>
              )}

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm dark:shadow-none">
                Voir le détail complet
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}