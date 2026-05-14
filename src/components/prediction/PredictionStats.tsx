"use client";

import { PredictionPoint } from "@/lib/predictionEmballageService";
import { TrendingUp, Package, BarChart3, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  data: PredictionPoint[];
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{display.toFixed(2)}</>;
}

const cards = [
  {
    key: "total",
    title: "Total prédit",
    subtitle: "Somme cumulée",
    icon: Package,
    gradient: "from-blue-600 to-cyan-500",
    glow: "shadow-blue-500/25",
    bg: "from-blue-50 to-cyan-50",
    iconBg: "bg-gradient-to-br from-blue-600 to-cyan-500",
    badge: "text-blue-700 bg-blue-100",
  },
  {
    key: "avg",
    title: "Moyenne période",
    subtitle: "Par unité de temps",
    icon: BarChart3,
    gradient: "from-violet-600 to-purple-500",
    glow: "shadow-violet-500/25",
    bg: "from-violet-50 to-purple-50",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-500",
    badge: "text-violet-700 bg-violet-100",
  },
  {
    key: "max",
    title: "Pic prévu",
    subtitle: "Valeur maximale",
    icon: TrendingUp,
    gradient: "from-emerald-600 to-teal-500",
    glow: "shadow-emerald-500/25",
    bg: "from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-500",
    badge: "text-emerald-700 bg-emerald-100",
  },
];

export default function PredictionStats({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.quantite_predite, 0);
  const avg = data.length ? total / data.length : 0;
  const max = data.length ? Math.max(...data.map((item) => item.quantite_predite)) : 0;

  const values: Record<string, number> = { total, avg, max };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const val = values[card.key];
        const pct = max > 0 ? (val / max) * 100 : 0;

        return (
          <div
            key={card.key}
            className={`
              relative overflow-hidden rounded-2xl border border-white/60
              bg-gradient-to-br ${card.bg}
              p-6 shadow-xl ${card.glow}
              transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
              group cursor-default
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10 blur-xl bg-gradient-to-br from-current to-transparent" />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {card.title}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  {data.length > 0 ? <AnimatedNumber value={val} /> : "—"}
                </p>
                <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
              </div>

              <div className={`${card.iconBg} rounded-xl p-3 shadow-lg`}>
                <Icon className="text-white" size={20} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">Rapport au pic</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200/70 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-1000 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Hover arrow */}
            <ArrowUpRight
              size={16}
              className="absolute bottom-4 right-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        );
      })}
    </div>
  );
}