// WarehouseStatusWidget.tsx
"use client";

import Link from "next/link";
import { ArrowUpRight, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Building2, Gauge, Zap, Activity, PieChart as PieChartIcon } from "lucide-react";
import { useWarehouseCapacityStats } from "@/hooks/useWarehouseCapacityStats";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar } from "recharts";

export default function WarehouseStatusWidget() {
  const { data, isLoading, isError } = useWarehouseCapacityStats();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between">
            <div className="h-5 w-32 rounded-lg bg-slate-200" />
            <div className="h-5 w-20 rounded-lg bg-slate-200" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-2 rounded-full bg-slate-100" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="h-3 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 p-6 text-center shadow-lg border border-rose-200">
        <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-sm font-medium text-rose-600">
          Impossible de charger les données des entrepôts
        </p>
        <p className="text-xs text-rose-500/70 mt-1">Vérifiez votre connexion</p>
      </div>
    );
  }

  const warehouses = data;
  const total = warehouses.length;
  const criticalCount = warehouses.filter(w => w.level === "critical").length;
  const warningCount = warehouses.filter(w => w.level === "warning").length;
  const healthyCount = total - criticalCount - warningCount;
  
  const avgFillRate = total > 0 
    ? warehouses.reduce((sum, w) => sum + w.fillRate, 0) / total 
    : 0;

  const topCritical = [...warehouses]
    .sort((a, b) => b.fillRate - a.fillRate)
    .slice(0, 5);

  const getTrend = () => {
    if (criticalCount > 2) return { label: "Tendance haussière", color: "text-rose-600", bg: "bg-rose-50", icon: TrendingUp, border: "border-rose-200" };
    if (warningCount > 3) return { label: "Stabilité fragile", color: "text-amber-600", bg: "bg-amber-50", icon: TrendingUp, border: "border-amber-200" };
    return { label: "Situation stable", color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingDown, border: "border-emerald-200" };
  };

  const trend = getTrend();
  const TrendIcon = trend.icon;

  // Données pour le graphique circulaire
  const pieData = [
    { name: "Sain", value: healthyCount, color: "#10b981" },
    { name: "Attention", value: warningCount, color: "#f59e0b" },
    { name: "Critique", value: criticalCount, color: "#f43f5e" },
  ];

  // Données pour le gauge radial
  const radialData = [{ name: "Occupation", value: avgFillRate, fill: "#3b82f6" }];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500">
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Dégradé d'arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 shadow-md">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Capacité des entrepôts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vue d'ensemble de l'occupation
              </p>
            </div>
          </div>
          <Link
            href="/entrepots"
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
          >
            Détails
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Section graphiques - Nouveau layout avec visualisations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Graphique circulaire */}
          <div className="lg:col-span-1">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-1">
              <p className="text-2xl font-bold text-slate-800">{total}</p>
              <p className="text-[10px] text-slate-500">Total entrepôts</p>
            </div>
          </div>

          {/* Cartes de statut modernisées */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-3 h-full">
              <div className="group/stat relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3 text-center border border-emerald-200 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-2 group-hover/stat:scale-110 transition-transform">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-700">{healthyCount}</p>
                <p className="text-xs font-medium text-emerald-600/80 mt-1">Sain</p>
                <div className="mt-1.5 h-1 w-full bg-emerald-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(healthyCount/total)*100}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-500/70 mt-1.5">
                  {((healthyCount/total)*100).toFixed(0)}% du total
                </p>
              </div>
              
              <div className="group/stat relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-3 text-center border border-amber-200 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-2 group-hover/stat:scale-110 transition-transform">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-700">{warningCount}</p>
                <p className="text-xs font-medium text-amber-600/80 mt-1">Attention</p>
                <div className="mt-1.5 h-1 w-full bg-amber-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(warningCount/total)*100}%` }}
                  />
                </div>
                <p className="text-[10px] text-amber-500/70 mt-1.5">
                  {((warningCount/total)*100).toFixed(0)}% du total
                </p>
              </div>
              
              <div className="group/stat relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 p-3 text-center border border-rose-200 hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-2 group-hover/stat:scale-110 transition-transform">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                </div>
                <p className="text-2xl font-bold text-rose-700">{criticalCount}</p>
                <p className="text-xs font-medium text-rose-600/80 mt-1">Critique</p>
                <div className="mt-1.5 h-1 w-full bg-rose-200/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(criticalCount/total)*100}%` }}
                  />
                </div>
                <p className="text-[10px] text-rose-500/70 mt-1.5">
                  {((criticalCount/total)*100).toFixed(0)}% du total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jauge d'occupation moyenne avec style amélioré */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-100">
                <Gauge className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                Occupation moyenne
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${trend.bg} border ${trend.border}`}>
              <TrendIcon className={`h-3 w-3 ${trend.color}`} />
              <span className={`text-xs font-bold ${trend.color}`}>
                {avgFillRate.toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-400 ml-1">{trend.label}</span>
            </div>
          </div>
          
          {/* Barre de progression avec effet gradient et animation */}
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400 transition-all duration-1000"
              style={{ width: `${avgFillRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
            </div>
          </div>
          
          {/* Indicateurs de seuil */}
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[9px] text-emerald-500">● Sain</span>
            <span className="text-[9px] text-amber-500">● Attention</span>
            <span className="text-[9px] text-rose-500">● Critique</span>
          </div>
        </div>

        {/* Liste des entrepôts prioritaires avec design amélioré */}
        {topCritical.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-100">
                  <Zap className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Priorité élevée
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {topCritical.filter(w => w.fillRate > 80).length} alerte(s)
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {topCritical.slice(0, 4).map((warehouse, idx) => {
                const fillRate = warehouse.fillRate;
                const isCritical = warehouse.level === "critical";
                const isWarning = warehouse.level === "warning";
                
                return (
                  <div key={warehouse.id} className="group/item">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-2 w-2 rounded-full ${
                          isCritical ? "bg-rose-500 shadow-sm shadow-rose-200" : 
                          isWarning ? "bg-amber-500 shadow-sm shadow-amber-200" : 
                          "bg-emerald-500"
                        }`} />
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">
                          {warehouse.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 text-right">
                          <span className={`text-sm font-bold ${
                            isCritical ? "text-rose-600" : 
                            isWarning ? "text-amber-600" : 
                            "text-emerald-600"
                          }`}>
                            {fillRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical ? "bg-gradient-to-r from-rose-400 to-rose-500" : 
                              isWarning ? "bg-gradient-to-r from-amber-400 to-amber-500" : 
                              "bg-gradient-to-r from-emerald-400 to-emerald-500"
                            }`}
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Barre de progression fine sous chaque élément */}
                    <div className="ml-4">
                      <div className="h-0.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isCritical ? "bg-rose-200" : isWarning ? "bg-amber-200" : "bg-emerald-200"
                          }`}
                          style={{ width: `${fillRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {topCritical.length > 4 && (
              <div className="mt-3 text-center">
                <p className="text-[10px] font-medium text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded-full">
                  +{topCritical.length - 4} autre(s) site(s) à surveiller
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message de statut animé avec icône */}
        <div className={`mt-5 rounded-xl p-3.5 text-center transition-all ${
          criticalCount > 0 
            ? "bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 shadow-sm" 
            : warningCount > 0 
            ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm"
            : "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-center gap-2.5">
            {criticalCount > 0 && (
              <>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  🔴 {criticalCount} site(s) nécessitent une intervention immédiate
                </p>
              </>
            )}
            {criticalCount === 0 && warningCount > 0 && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs font-semibold text-slate-700">
                  🟠 {warningCount} site(s) approchent leur capacité maximale
                </p>
              </>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-semibold text-slate-700">
                  🟢 Tous les sites fonctionnent normalement
                </p>
              </>
            )}
          </div>
        </div>

        {/* Indicateur de mise à jour en temps réel */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Mise à jour en temps réel</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400">Synchro active</span>
          </div>
        </div>
      </div>
    </div>
  );
}