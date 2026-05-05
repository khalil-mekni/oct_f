"use client";

import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { FileText, ShieldAlert, CircleCheckBig, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { useContractsWidget } from "@/hooks/useContractsWidget";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

/* ─── Helpers ─────────────────────────────────────────────── */

function statusColor(status: string): "success" | "error" | "warning" | "light" {
  switch (status?.toLowerCase()) {
    case "active": case "actif":   return "success";
    case "expired": case "expiré": return "error";
    case "pending": case "draft": case "brouillon": return "warning";
    default: return "light";
  }
}
function statusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "active":  return "Actif";
    case "expired": return "Expiré";
    case "pending": return "En attente";
    default:        return status;
  }
}
function getDaysInfo(endDate: string) {
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0)   return { dot: "bg-rose-500",   text: `${Math.abs(days)}j dépassé` };
  if (days <= 7)  return { dot: "bg-rose-500",   text: `${days}j` };
  if (days <= 30) return { dot: "bg-amber-500",  text: `${days}j` };
  if (days <= 90) return { dot: "bg-emerald-500",text: `${days}j` };
  return                  { dot: "bg-slate-400",  text: `${days}j` };
}

/* ─── Custom tooltip ──────────────────────────────────────── */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-xl text-xs">
      <p style={{ color: payload[0].payload.fill }} className="font-bold">{payload[0].name}</p>
      <p className="text-slate-600 dark:text-slate-300 font-semibold">{payload[0].value} contrats</p>
    </div>
  );
}

/* ─── Stat card ────────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, color, bg }: {
  icon: React.ElementType; value: number; label: string; color: string; bg: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl ${bg} px-4 py-3`}>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color} bg-white/30 dark:bg-white/10`}>
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

export default function ContractsWidget() {
  const { data, isLoading, isError, error } = useContractsWidget();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse">
        <div className="h-8 w-40 rounded-xl bg-slate-100 dark:bg-white/10 mb-5" />
        <div className="h-40 rounded-2xl bg-slate-100 dark:bg-white/5 mb-5" />
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-10 text-amber-400" />
        <p className="font-bold text-amber-700 dark:text-amber-400">Erreur de chargement</p>
        {error instanceof Error && <p className="mt-1 text-sm text-amber-500">{error.message}</p>}
      </div>
    );
  }

  const inactive = data.totalContracts - data.activeContracts;
  const pieData = [
    { name: "Actifs",     value: data.activeContracts,  fill: "#6366f1" },
    { name: "Expirant",   value: data.expiringSoon,      fill: "#f59e0b" },
    { name: "Alertes",    value: data.contractAlerts,    fill: "#f43f5e" },
    { name: "Inactifs",   value: Math.max(0, inactive - data.expiringSoon - data.contractAlerts), fill: "#cbd5e1" },
  ].filter((d) => d.value > 0);

  const displayed = expanded ? data.recentContracts : data.recentContracts.slice(0, 4);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
            <FileText className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Contrats</h3>
            <p className="text-xs text-slate-400">Synthèse &amp; suivi des échéances</p>
          </div>
        </div>
        <span className="rounded-full bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400">
          {data.totalContracts} contrats
        </span>
      </div>

      <div className="p-6 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={CircleCheckBig} value={data.activeContracts} label="Actifs"       color="text-indigo-600 dark:text-indigo-300"  bg="bg-indigo-50 dark:bg-indigo-500/10" />
          <StatCard icon={FileText}       value={data.totalContracts}  label="Total"        color="text-slate-600  dark:text-slate-300"   bg="bg-slate-100 dark:bg-white/8" />
          <StatCard icon={Clock}          value={data.expiringSoon}    label="Expirant"     color="text-amber-600  dark:text-amber-300"   bg="bg-amber-50  dark:bg-amber-500/10" />
          <StatCard icon={ShieldAlert}    value={data.contractAlerts}  label="Alertes"      color="text-rose-600   dark:text-rose-300"    bg="bg-rose-50   dark:bg-rose-500/10" />
        </div>

        {/* Donut chart */}
        {pieData.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Répartition des contrats</h4>
            <div className="flex items-center gap-4">
              <div className="h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={38} outerRadius={58}
                      paddingAngle={3} dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 dark:border-white/8">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Taux d'activité</span>
                    <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                      {data.totalContracts > 0 ? ((data.activeContracts / data.totalContracts) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${data.totalContracts > 0 ? (data.activeContracts / data.totalContracts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Derniers contrats</h4>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              {expanded ? "Voir moins" : "Voir tout"}
              <ChevronRight className={`size-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/8">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/[0.03]">
                <TableRow>
                  {["Référence", "Partenaire", "Échéance", "Statut"].map((h) => (
                    <TableCell key={h} isHeader className="py-2.5 text-start text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayed.length === 0 ? (
                  <TableRow><td colSpan={4} className="py-6 text-center text-xs text-slate-400">Aucun contrat récent.</td></TableRow>
                ) : (
                  displayed.map((c) => {
                    const di = c.endDate ? getDaysInfo(c.endDate) : null;
                    return (
                      <TableRow key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="py-2.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{c.reference}</p>
                          <p className="text-[10px] text-slate-400">{c.title ?? "Contrat"}</p>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs text-slate-500 dark:text-slate-400">{c.partnerName ?? "—"}</TableCell>
                        <TableCell className="py-2.5">
                          {c.endDate && di ? (
                            <div className="flex items-center gap-1.5">
                              <span className={`size-1.5 rounded-full ${di.dot} shrink-0`} />
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{di.text}</span>
                            </div>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge size="sm" color={statusColor(c.status)}>{statusLabel(c.status)}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}