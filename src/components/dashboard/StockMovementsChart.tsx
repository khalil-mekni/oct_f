// StockMovementsChart.tsx
"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useMemo, useState } from "react";
import { useStockMovementsStats } from "@/hooks/useStockMovementsStats";
import { TrendingUp, TrendingDown, Package, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle, Calendar, Download } from "lucide-react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StockMovementsChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<"7d" | "14d" | "30d">("7d");
  const { data, isLoading, isError } = useStockMovementsStats(period);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const stats = data ?? [];

  const categories = stats.map((item) => item.label);

  const totalIns = stats.reduce((sum, item) => sum + item.in_count, 0);
  const totalOuts = stats.reduce((sum, item) => sum + item.out_count, 0);
  const totalTransfers = stats.reduce((sum, item) => sum + item.transfer_count, 0);
  const totalLosses = stats.reduce((sum, item) => sum + item.loss_count, 0);
  const balance = totalIns - totalOuts;

  // Palette de couleurs claires : vert canard, bleu ciel, corail, lavande
  const colors = {
    teal: "#14B8A6",      // Vert canard / Teal
    sky: "#0EA5E9",       // Bleu ciel
    coral: "#FB923C",     // Corail
    lavender: "#A78BFA",  // Lavande
    mint: "#34D399",      // Menthe
    rose: "#F43F5E",      // Rose pour les pertes
  };

  const series = [
    {
      name: "Entrées",
      data: stats.map((item) => item.in_count),
      color: colors.teal,
    },
    {
      name: "Sorties",
      data: stats.map((item) => item.out_count),
      color: colors.rose,
    },
    {
      name: "Transferts",
      data: stats.map((item) => item.transfer_count),
      color: colors.sky,
    },
    {
      name: "Pertes",
      data: stats.map((item) => item.loss_count),
      color: colors.lavender,
    },
  ];

  // Graphique en aires empilées pour une meilleure visualisation des tendances
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Inter, sans-serif",
        type: "area",
        height: 380,
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        background: 'transparent',
      },
      colors: [colors.teal, colors.rose, colors.sky, colors.lavender],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 0.3,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            fontSize: '11px',
            colors: '#94A3B8',
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: "Nombre de mouvements",
          style: {
            fontSize: '11px',
            color: '#64748B',
            fontWeight: 500,
          },
        },
        labels: {
          style: {
            colors: '#94A3B8',
          },
        },
        min: 0,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        fontFamily: "Inter",
        fontSize: '12px',
        fontWeight: 500,
        markers: {
          shape: 'circle',
          radius: 6,
        },
        itemMargin: {
          horizontal: 12,
          vertical: 4,
        },
      },
      grid: {
        borderColor: '#E2E8F0',
        strokeDashArray: 4,
        position: 'back',
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        y: {
          formatter: (val: number) => `${val} mouvements`,
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      markers: {
        size: 3,
        strokeWidth: 0,
        hover: {
          size: 6,
        },
      },
    }),
    [categories]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-6 w-40 rounded-lg bg-slate-200" />
              <div className="h-4 w-64 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-32 rounded-lg bg-slate-200" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-[340px] rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 p-6 text-center shadow-lg border border-sky-100">
        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="h-6 w-6 text-sky-500" />
        </div>
        <p className="text-sm font-medium text-sky-600">
          Impossible de charger les statistiques des mouvements
        </p>
        <p className="text-xs text-sky-500/70 mt-1">Vérifiez votre connexion et réessayez</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50/30 to-white p-6 shadow-xl border border-slate-100">
      {/* En-tête avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 p-2 shadow-md">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Activité des mouvements
            </h3>
          </div>
          <p className="text-sm text-slate-500 ml-11">
            Analyse des flux entrants, sortants, transferts et pertes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sélecteur de période stylisé */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { value: "7d", label: "7 jours" },
              { value: "14d", label: "14 jours" },
              { value: "30d", label: "30 jours" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  period === p.value
                    ? "bg-white text-teal-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dropdown menu */}
          <div className="relative inline-block">
            <button
              onClick={toggleDropdown}
              className="p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
            >
              <MoreDotIcon className="text-slate-400 hover:text-slate-600" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-44 p-2 bg-white shadow-lg rounded-xl border border-slate-100"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2 font-normal text-left text-slate-600 rounded-lg hover:bg-slate-50 px-3 py-2 text-sm"
              >
                <Download className="h-4 w-4 text-teal-500" />
                Exporter les données
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full items-center gap-2 font-normal text-left text-slate-600 rounded-lg hover:bg-slate-50 px-3 py-2 text-sm"
              >
                <Calendar className="h-4 w-4 text-sky-500" />
                Personnaliser la période
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Cartes récapitulatives modernisées */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 p-3 border border-teal-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">Entrées</span>
            <ArrowUpCircle className="h-4 w-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-teal-700">{totalIns}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-teal-500" />
            <span className="text-[10px] font-medium text-teal-600">+{((totalIns / (totalIns + totalOuts)) * 100).toFixed(0)}% du flux</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 p-3 border border-rose-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-600 uppercase tracking-wide">Sorties</span>
            <ArrowDownCircle className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-rose-700">{totalOuts}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3 text-rose-500" />
            <span className="text-[10px] font-medium text-rose-600">-{((totalOuts / (totalIns + totalOuts)) * 100).toFixed(0)}% du flux</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-sky-100/50 p-3 border border-sky-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-sky-600 uppercase tracking-wide">Transferts</span>
            <RefreshCw className="h-4 w-4 text-sky-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-sky-700">{totalTransfers}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] font-medium text-sky-600">{((totalTransfers / (totalIns + totalOuts + totalTransfers)) * 100).toFixed(1)}% du total</span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-lavender-50 to-lavender-100/50 p-3 border border-lavender-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-lavender-600 uppercase tracking-wide">Pertes</span>
            <AlertCircle className="h-4 w-4 text-lavender-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-lavender-700">{totalLosses}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] font-medium text-lavender-600">{((totalLosses / (totalIns + totalOuts)) * 100).toFixed(1)}% des sorties</span>
          </div>
        </div>

        <div className={`group relative overflow-hidden rounded-xl p-3 border transition-all ${
          balance >= 0 
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200" 
            : "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-200"
        } hover:shadow-md`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600">Solde net</span>
            {balance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {balance >= 0 ? "+" : ""}{balance}
          </p>
          <div className="mt-1">
            <span className={`text-[10px] font-medium ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {balance >= 0 ? "Flux positif" : "Flux négatif"}
            </span>
          </div>
        </div>
      </div>

      {/* Graphique en aires empilées */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[650px]">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={380}
          />
        </div>
      </div>

      {/* Légende supplémentaire avec tendances */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-xs text-slate-600">Tendance entrées à la hausse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500" />
              <span className="text-xs text-slate-600">Transferts actifs</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Mise à jour en temps réel
          </div>
        </div>
      </div>
    </div>
  );
}