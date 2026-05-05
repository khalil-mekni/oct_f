"use client";

import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Activity } from "lucide-react";
import { StockHistoryItem } from "@/types/stock";

type Props = { items: StockHistoryItem[] };

export default function StockStatCards({ items }: Props) {
  const entrees = items.filter((i) => i.sens === "E");
  const sorties = items.filter((i) => i.sens === "S");
  const totalE = entrees.reduce((s, i) => s + Number(i.quantite ?? 0), 0);
  const totalS = sorties.reduce((s, i) => s + Number(i.quantite ?? 0), 0);
  const transferts = Math.min(entrees.length, sorties.length);
  const solde = totalE - totalS;

  const stats = [
    {
      label: "Mouvements",
      value: items.length,
      sub: "lignes totales",
      icon: <Activity size={18} className="text-[#00A09D]" />,
      iconBg: "bg-[#00A09D]/10",
      valueColor: "text-[#1C2434] dark:text-white",
      accent: "border-[#00A09D]/15",
      badge: null,
    },
    {
      label: "Entrées",
      value: entrees.length,
      sub: `${totalE.toLocaleString("fr-FR")} unités`,
      icon: <ArrowDownCircle size={18} className="text-[#00A09D]" />,
      iconBg: "bg-[#00A09D]/10",
      valueColor: "text-[#00A09D]",
      accent: "border-[#00A09D]/15",
      badge: (
        <span className="rounded-lg border border-[#00A09D]/20 bg-[#00A09D]/8 px-2 py-0.5 font-mono text-[10px] font-black text-[#00A09D]">
          +{totalE.toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      label: "Sorties",
      value: sorties.length,
      sub: `${totalS.toLocaleString("fr-FR")} unités`,
      icon: <ArrowUpCircle size={18} className="text-red-500" />,
      iconBg: "bg-red-50",
      valueColor: "text-red-500",
      accent: "border-red-100",
      badge: (
        <span className="rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-black text-red-500">
          -{totalS.toLocaleString("fr-FR")}
        </span>
      ),
    },
    {
      label: "Solde net",
      value: solde >= 0 ? `+${solde.toLocaleString("fr-FR")}` : solde.toLocaleString("fr-FR"),
      sub: `${transferts} transfert(s) détecté(s)`,
      icon: <ArrowLeftRight size={18} className="text-amber-500" />,
      iconBg: "bg-amber-50",
      valueColor: solde >= 0 ? "text-[#00A09D]" : "text-red-500",
      accent: "border-amber-100",
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`group relative overflow-hidden rounded-2xl border bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 ${s.accent} dark:border-gray-800`}
        >
          {/* Top row */}
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
              {s.label}
            </p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.iconBg}`}
            >
              {s.icon}
            </div>
          </div>

          {/* Value */}
          <p
            className={`mt-2 font-mono text-3xl font-[1000] tracking-tighter ${s.valueColor}`}
          >
            {s.value}
          </p>

          {/* Sub */}
          <div className="mt-1.5 flex items-center gap-2">
            <p className="text-[10px] font-bold text-gray-400">{s.sub}</p>
            {s.badge}
          </div>

          {/* Decorative accent line */}
          <div
            className={`absolute bottom-0 left-0 h-0.5 w-full opacity-40 ${
              s.valueColor === "text-[#00A09D]" || s.valueColor === "text-[#1C2434] dark:text-white"
                ? "bg-[#00A09D]"
                : s.valueColor === "text-red-500"
                  ? "bg-red-400"
                  : "bg-amber-400"
            }`}
          />
        </div>
      ))}
    </div>
  );
}