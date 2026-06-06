"use client";

import Link from "next/link";
import { BellRing, Building2, ArrowRightLeft, LayoutDashboard, Package, FileText, Truck } from "lucide-react";

function AccentKpi({
  label, value, unit, bgColor, iconColor, borderColor, barColor, barWidth, icon: Icon,
}: {
  label: string; value: string; unit?: string;
  bgColor: string; iconColor: string; borderColor: string;
  barColor: string; barWidth: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-4 transition-colors hover:border-[var(--border-hover)]"
      style={{ "--border": "rgba(0,0,0,0.08)", "--border-hover": "rgba(0,0,0,0.15)" } as React.CSSProperties}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
        style={{ background: bgColor, borderColor: borderColor }}
      >
        <Icon style={{ color: iconColor }} className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-[22px] font-medium leading-none tracking-tight text-slate-800">
          {value}
          {unit && <span className="ml-1 text-[11px] font-medium text-slate-400">{unit}</span>}
        </p>
        <div className="mt-2.5 h-[3px] rounded-full" style={{ background: barColor, width: barWidth }} />
      </div>
    </div>
  );
}

export default function DashboardHeader() {
  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border"
            style={{ background: "#e8fafe", borderColor: "#a8f0fc" }}
          >
            <LayoutDashboard className="size-5" style={{ color: "#0bbcd9" }} />
          </div>
          <div>
            <h1 className="text-[18px] font-medium tracking-tight text-slate-900 leading-tight">
              Tableau de Bord{" "}
              <span style={{ color: "#21DAFF" }}>Logistique</span>
            </h1>
            <p className="mt-0.5 text-[12px] text-slate-400">
              Pilotage opérationnel des flux et entrepôts
            </p>
          </div>
          <div
            className="ml-2 hidden lg:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "#e6faf4", borderColor: "#8de8c6", color: "#0a7a51" }}
          >
            <span
              className="relative flex h-[7px] w-[7px] rounded-full"
              style={{ background: "#0FAC71", animation: "pulse 2s infinite" }}
            />
            Système en ligne
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
          >
            <BellRing className="size-4" />
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-white text-[9px] font-medium"
              style={{ background: "#fde8e5", color: "#c4432e" }}
            >
              3
            </span>
          </Link>

          <div className="mx-1 hidden h-6 w-px bg-slate-100 sm:block" />

          <Link
            href="/entrepots"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            <Building2 className="size-3.5" />
            Entrepôts
          </Link>

          <Link
            href="/mouvements"
            className="inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[12px] font-medium transition-colors"
            style={{ background: "#e4fbff", borderColor: "#a8f0fc", color: "#0a9db8" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#c2f5fd")}
            onMouseLeave={e => (e.currentTarget.style.background = "#e4fbff")}
          >
            <ArrowRightLeft className="size-3.5" />
            Mouvements
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AccentKpi
          label="Stock en transit"
          value="124" unit="unités"
          bgColor="#fdecea" iconColor="#d9553d" borderColor="#f8bdb4"
          barColor="#F38071" barWidth="62%"
          icon={Package}
        />
        <AccentKpi
          label="Contrats actifs"
          value="38" unit="contrats"
          bgColor="#e6faf4" iconColor="#0a9966" borderColor="#8de8c6"
          barColor="#0FAC71" barWidth="76%"
          icon={FileText}
        />
        <AccentKpi
          label="BL en attente"
          value="12" unit="bons"
          bgColor="#fefbe8" iconColor="#b8920a" borderColor="#f5e080"
          barColor="#F8DE65" barWidth="24%"
          icon={Truck}
        />
      </div>
    </div>
  );
}
