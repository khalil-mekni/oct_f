"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { CalenderIcon } from "../../icons";
import { useAlertsSummary } from "@/hooks/useAlertsSummary";

// Icônes SVG simples faites maison
const InfoIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CriticalIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TrendIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function AlertsStatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError } = useAlertsSummary();

  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400">
        Impossible de charger les statistiques d'alertes.
      </div>
    );
  }

  const total = data.info + data.warning + data.critical;
  const severityScore = total > 0 
    ? ((data.critical * 3 + data.warning * 2 + data.info * 1) / (total * 3) * 100).toFixed(1)
    : "0";

  const getSeverityLevel = () => {
    const score = parseFloat(severityScore);
    if (score >= 70) return { text: "Critique", color: "red", emoji: "🔴", bgColor: "bg-red-100 dark:bg-red-900/20", textColor: "text-red-700 dark:text-red-300" };
    if (score >= 40) return { text: "Modéré", color: "orange", emoji: "🟠", bgColor: "bg-orange-100 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-300" };
    return { text: "Faible", color: "green", emoji: "🟢", bgColor: "bg-green-100 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-300" };
  };

  const severityLevel = getSeverityLevel();

  const cards = [
    {
      title: "Alertes Info",
      value: data.info,
      percentage: total > 0 ? ((data.info / total) * 100).toFixed(1) : 0,
      icon: InfoIcon,
      color: "blue",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-600 dark:text-blue-400",
      bgIcon: "bg-blue-100 dark:bg-blue-900/30",
      description: "Informations & notifications",
    },
    {
      title: "Alertes Warning",
      value: data.warning,
      percentage: total > 0 ? ((data.warning / total) * 100).toFixed(1) : 0,
      icon: WarningIcon,
      color: "orange",
      bgGradient: "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      textColor: "text-orange-600 dark:text-orange-400",
      bgIcon: "bg-orange-100 dark:bg-orange-900/30",
      description: "À surveiller attentivement",
    },
    {
      title: "Alertes Critical",
      value: data.critical,
      percentage: total > 0 ? ((data.critical / total) * 100).toFixed(1) : 0,
      icon: CriticalIcon,
      color: "red",
      bgGradient: "from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-600 dark:text-red-400",
      bgIcon: "bg-red-100 dark:bg-red-900/30",
      description: "Action immédiate requise",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de date */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
          <div className="w-full">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 shadow-lg">
                <BellIcon />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Tableau de bord des alertes
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Vue synthétique par niveau de sévérité
                </p>
              </div>
            </div>
          </div>

          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-44 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600"
              placeholder="Sélectionner une période"
            />
          </div>
        </div>

        {/* Cartes principales */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.bgGradient} p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full" />
              
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
                <div className={`rounded-xl ${card.bgIcon} p-3 shadow-lg ${card.textColor}`}>
                  <card.icon />
                </div>
              </div>

              <div className="relative mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Proportion</span>
                  <span className={`font-semibold ${card.textColor}`}>{card.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-${card.color}-500`}
                    style={{ width: `${card.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section de métriques avancées */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Carte de score de sévérité */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <ShieldIcon />
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                Indice de sévérité global
              </h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {severityScore}%
                </div>
                <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 ${severityLevel.bgColor}`}>
                  <span className="text-lg">{severityLevel.emoji}</span>
                  <span className={`text-sm font-medium ${severityLevel.textColor}`}>
                    Niveau {severityLevel.text}
                  </span>
                </div>
              </div>
              
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90 transform">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - parseFloat(severityScore) / 100)}`}
                    className={`text-${severityLevel.color}-500 transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {severityScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Carte de tendance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <TrendIcon />
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                Analyse rapide
              </h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total des alertes</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Alertes critiques / total</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {data.critical} / {total}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux de criticité</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {total > 0 ? ((data.critical / total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {data.critical > 5 && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-xs text-red-700 dark:text-red-300">
                  ⚠️ Nombre élevé d'alertes critiques détecté. Une attention immédiate est recommandée.
                </p>
              </div>
            )}

            {total === 0 && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <p className="text-xs text-green-700 dark:text-green-300">
                  ✅ Aucune alerte enregistrée. Tout est sous contrôle !
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Badge récapitulatif */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/30">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Info: {data.info}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Warning: {data.warning}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Critical: {data.critical}</span>
          </div>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            <BellIcon />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Total: {total} alerte{total > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}