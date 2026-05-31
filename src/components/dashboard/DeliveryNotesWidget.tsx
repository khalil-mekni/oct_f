"use client";

import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
  ClipboardCheck, Truck, Warehouse, Clock,
  CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
import { useDeliveryNotesWidget } from "@/hooks/useDeliveryNotesWidget";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

/* ─── Helpers ─────────────────────────────────────────────── */

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "validé": case "valide": case "validated": return "success";
    case "en_attente": case "pending": case "en attente": return "warning";
    default: return "light";
  }
}
function getDaysSince(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff < 7)  return `${diff}j`;
  if (diff < 30) return `${Math.floor(diff / 7)}sem.`;
  return `${Math.floor(diff / 30)}mois`;
}

/* ─── Custom tooltip ──────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

/* ─── KPI tile ─────────────────────────────────────────────── */
function KpiTile({ icon: Icon, value, label, color, bg }: {
  icon: React.ElementType; value: number; label: string; color: string; bg: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl ${bg} px-4 py-3`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/30 dark:bg-white/10 ${color}`}>
        <Icon className="size-3.5" />
      </div>
      <div>
        <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{label}</p>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────── */

export default function DeliveryNotesWidget() {
  const { data, isLoading, isError, error } = useDeliveryNotesWidget();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-white/10 mb-5" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />)}
        </div>
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/30 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-10 text-rose-400" />
        <p className="font-bold text-rose-700 dark:text-rose-400">Erreur de chargement</p>
        {error instanceof Error && <p className="mt-1 text-sm text-rose-500">{error.message}</p>}
      </div>
    );
  }

  const validationRate = data.total > 0 ? (data.validated / data.total) * 100 : 0;
  const pendingRate    = data.total > 0 ? (data.pending    / data.total) * 100 : 0;

  /* Radial chart data */
  const radialData = [
    { name: "Validés",    value: validationRate, fill: "#10b981" },
    { name: "En attente", value: pendingRate,     fill: "#f59e0b" },
  ];

  /* Warehouse bar chart */
  const warehouseMap: Record<string, { count: number; validated: number }> = {};
  data.recentDeliveryNotes.forEach((n) => {
    const w = n.entrepotName || "N/A";
    if (!warehouseMap[w]) warehouseMap[w] = { count: 0, validated: 0 };
    warehouseMap[w].count++;
    if (n.statut === "validé") warehouseMap[w].validated++;
  });
  const warehouseData = Object.entries(warehouseMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, v]) => ({
      name: name.length > 10 ? name.slice(0, 10) + "…" : name,
      total: v.count,
      validés: v.validated,
    }));

  const displayed = expanded ? data.recentDeliveryNotes : data.recentDeliveryNotes.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
            <Truck className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Détails des Livraisons</h3>
            <p className="text-xs text-slate-400">Flux des derniers bons de livraison</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>

      <div className="p-6 space-y-5">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3">
          <KpiTile icon={Truck}        value={data.total}              label="Total"      color="text-slate-600  dark:text-slate-300"  bg="bg-slate-100 dark:bg-white/8" />
          <KpiTile icon={CheckCircle2} value={data.validated}          label="Validés"    color="text-emerald-600 dark:text-emerald-300" bg="bg-emerald-50 dark:bg-emerald-500/10" />
          <KpiTile icon={Clock}        value={data.pending}            label="En attente" color="text-amber-600  dark:text-amber-300"  bg="bg-amber-50  dark:bg-amber-500/10" />
          <KpiTile icon={Warehouse}    value={data.warehousesInvolved} label="Entrepôts"  color="text-blue-600   dark:text-blue-300"   bg="bg-blue-50   dark:bg-blue-500/10" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-5 gap-4">

          {/* Radial gauges (2/5) */}
          <div className="col-span-2 rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-4 flex flex-col">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Taux</h4>
            <div className="flex-1 flex flex-col justify-center gap-3">
              {/* Validation gauge */}
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Validation</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{validationRate.toFixed(0)}%</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                    style={{ width: `${validationRate}%` }}
                  />
                </div>
              </div>
              {/* Pending gauge */}
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">En attente</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">{pendingRate.toFixed(0)}%</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${pendingRate}%` }}
                  />
                </div>
              </div>
              {/* Big number */}
              <div className="mt-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-center shadow-lg shadow-emerald-500/20">
                <p className="text-2xl font-black text-white">{validationRate.toFixed(0)}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">validés</p>
              </div>
            </div>
          </div>

          {/* Warehouse bar chart (3/5) */}
          <div className="col-span-3 rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-4">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Par entrepôt</h4>
            {warehouseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={warehouseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "currentColor" }} className="text-slate-400" />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="total"  name="Total"   fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="validés" name="Validés" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-36 items-center justify-center text-sm text-slate-400">Pas de données entrepôt</div>
            )}
            <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Total</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Validés</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bons de livraison récents</h4>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {expanded ? "Voir moins" : "Voir tout"}
              <ChevronRight className={`size-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/8">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/[0.03]">
                <TableRow>
                  {["BL", "Entrepôt", "Réception", "Statut"].map((h) => (
                    <TableCell key={h} isHeader className="py-2.5 text-start text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayed.length === 0 ? (
                  <TableRow><td colSpan={4} className="py-6 text-center text-xs text-slate-400">Aucun bon de livraison récent.</td></TableRow>
                ) : (
                  displayed.map((note) => (
                    <TableRow key={note.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-2.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{note.numero_bl}</p>
                        {note.commandeReference && <p className="text-[10px] text-slate-400">{note.commandeReference}</p>}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="size-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">{note.entrepotName ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {note.date_reception ? getDaysSince(note.date_reception) : "—"}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge size="sm" color={statusColor(note.statut) as any}>
                          {note.statut === "validé" ? "Validé" : note.statut === "en_attente" ? "En attente" : note.statut}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/8 pt-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-emerald-500" />{data.validated} validés</div>
          <div className="flex items-center gap-1.5"><Clock className="size-3 text-amber-500" />{data.pending} en attente</div>
        </div>
      </div>
    </div>
  );
}