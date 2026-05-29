"use client";

import { useState } from "react";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import {
  ShoppingCart, Clock3, PackageCheck, TriangleAlert,
  CheckCircle2, AlertCircle, Building2, ChevronRight, TrendingUp, TrendingDown,
} from "lucide-react";
import { useOrdersWidget } from "@/hooks/useOrdersWidget";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";


function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "validated": case "validée": case "reçue": case "received": return "success";
    case "pending": case "en attente": return "warning";
    case "partial": case "partielle": return "light";
    case "late": case "retard": return "error";
    default: return "light";
  }
}
function getStatusLabel(s: string) {
  switch (s?.toLowerCase()) {
    case "validated": return "Validée";
    case "received":  return "Reçue";
    case "pending":   return "En attente";
    case "partial":   return "Partielle";
    case "late":      return "En retard";
    default:          return s;
  }
}

/* ─── Custom tooltip ──────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

/* ─── Big KPI card ─────────────────────────────────────────── */

function BigKpi({ label, value, icon: Icon, trend, color, bg }: {
  label: string; value: number; icon: React.ElementType;
  trend?: number; color: string; bg: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
          <p className={`mt-1 text-3xl font-black tabular-nums ${color}`}>{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color} bg-white/20`}>
          <Icon className="size-4" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(trend)}% ce mois
        </div>
      )}
      {/* Decorative circle */}
      <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10" />
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────── */

export default function OrdersWidget() {
  const { data, isLoading, isError, error } = useOrdersWidget();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 animate-pulse">
        <div className="h-10 w-48 rounded-xl bg-slate-100 dark:bg-white/10 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-white/5" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5" />
          <div className="h-48 rounded-2xl bg-slate-100 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/30 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-10 text-rose-400" />
        <p className="font-bold text-rose-700 dark:text-rose-400">Erreur chargement des commandes</p>
        {error instanceof Error && <p className="mt-1 text-sm text-rose-500">{error.message}</p>}
      </div>
    );
  }

  const total         = data.total;
  const completionPct = total > 0 ? ((total - data.pending - data.late) / total) * 100 : 0;
  const latePct       = total > 0 ? (data.late    / total) * 100 : 0;
  const pendingPct    = total > 0 ? (data.pending / total) * 100 : 0;

  /* Build timeline chart data from recentOrders */
  const dateMap: Record<string, { validées: number; attente: number; retard: number }> = {};
  data.recentOrders.forEach((o) => {
    if (!o.date) return;
    const d = new Date(o.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    if (!dateMap[d]) dateMap[d] = { validées: 0, attente: 0, retard: 0 };
    if (o.status === "validated" || o.status === "received") dateMap[d].validées++;
    else if (o.status === "pending") dateMap[d].attente++;
    else if (o.status === "late") dateMap[d].retard++;
  });
  const timelineData = Object.entries(dateMap).map(([date, v]) => ({ date, ...v }));

  /* Supplier bar chart */
  const suppMap: Record<string, number> = {};
  data.recentOrders.forEach((o) => {
    const s = o.supplierName || "Autre";
    suppMap[s] = (suppMap[s] || 0) + 1;
  });
  const supplierData = Object.entries(suppMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.length > 10 ? name.slice(0, 10) + "…" : name, count }));

  const COLORS = ["#818cf8", "#34d399", "#f472b6", "#fb923c", "#60a5fa", "#a78bfa"];

  const displayed = expanded ? data.recentOrders : data.recentOrders.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <ShoppingCart className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Gestion des commandes</h3>
            <p className="text-xs text-slate-400">Suivi des commandes, réceptions et retards</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
          Temps réel
        </span>
      </div>

      <div className="p-6 space-y-6">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <BigKpi label="Total commandes" value={data.total}             icon={ShoppingCart}   color="text-indigo-600 dark:text-indigo-400"  bg="bg-indigo-50  dark:bg-indigo-500/10"  trend={8}  />
          <BigKpi label="En attente"      value={data.pending}           icon={Clock3}          color="text-amber-600  dark:text-amber-400"   bg="bg-amber-50   dark:bg-amber-500/10"   trend={-3} />
          <BigKpi label="Partielles"      value={data.partiallyReceived} icon={PackageCheck}    color="text-violet-600 dark:text-violet-400"  bg="bg-violet-50  dark:bg-violet-500/10"  />
          <BigKpi label="En retard"       value={data.late}              icon={TriangleAlert}   color="text-rose-600   dark:text-rose-400"    bg="bg-rose-50    dark:bg-rose-500/10"    trend={latePct > 10 ? 5 : -2} />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

          {/* Area chart — timeline (3/5) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Activité des commandes</h4>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" />Validées</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Attente</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Retard</span>
              </div>
            </div>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="validées" stroke="#818cf8" strokeWidth={2} fill="url(#gradV)" name="Validées" />
                  <Area type="monotone" dataKey="attente"  stroke="#f59e0b" strokeWidth={2} fill="url(#gradA)" name="En attente" />
                  <Area type="monotone" dataKey="retard"   stroke="#f43f5e" strokeWidth={2} fill="url(#gradR)" name="Retard" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-slate-400">Pas encore de données</div>
            )}
          </div>

          {/* Bar chart — suppliers (2/5) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-5">
            <h4 className="mb-4 text-sm font-bold text-slate-700 dark:text-slate-200">Top fournisseurs</h4>
            {supplierData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={supplierData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "currentColor" }} className="text-slate-400" />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Commandes" radius={[6, 6, 0, 0]}>
                    {supplierData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-slate-400">Pas encore de données</div>
            )}
          </div>
        </div>

        {/* ── Performance mini-bars ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Complétion",  pct: completionPct, from: "from-indigo-500", to: "to-violet-500",  val: "text-indigo-600 dark:text-indigo-400" },
            { label: "En retard",   pct: latePct,       from: "from-rose-500",   to: "to-pink-500",    val: "text-rose-600 dark:text-rose-400" },
            { label: "En attente",  pct: pendingPct,    from: "from-amber-500",  to: "to-orange-500",  val: "text-amber-600 dark:text-amber-400" },
          ].map(({ label, pct, from, to, val }) => (
            <div key={label} className="rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                <span className={`font-black tabular-nums ${val}`}>{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${from} ${to} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Commandes récentes</h4>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {expanded ? "Voir moins" : "Voir tout"}
              <ChevronRight className={`size-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/8">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/[0.03]">
                <TableRow>
                  {["Référence", "Fournisseur", "Date", "Statut"].map((h) => (
                    <TableCell key={h} isHeader className="py-2.5 text-start text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayed.length === 0 ? (
                  <TableRow><td colSpan={4} className="py-8 text-center text-sm text-slate-400">Aucune commande récente.</td></TableRow>
                ) : (
                  displayed.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{order.reference}</p>
                        <p className="text-[10px] text-slate-400">{order.totalLabel ?? "Commande"}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">{order.supplierName ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400">
                        {order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "—"}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge size="sm" color={statusColor(order.status) as any}>{getStatusLabel(order.status)}</Badge>
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
          <div className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-emerald-500" />{data.total - data.pending - data.late - data.partiallyReceived} traitées</div>
          <div className="flex items-center gap-1.5"><AlertCircle className="size-3 text-rose-500" />{data.late} en retard</div>
        </div>
      </div>
    </div>
  );
}