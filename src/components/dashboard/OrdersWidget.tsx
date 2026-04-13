// OrdersWidget.tsx
"use client";

import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ShoppingCart, Clock3, PackageCheck, TriangleAlert, TrendingUp, TrendingDown, CalendarDays, Truck, CheckCircle2, AlertCircle, Building2, ChevronRight, Gauge } from "lucide-react";
import { useOrdersWidget } from "@/hooks/useOrdersWidget";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, Area, AreaChart } from "recharts";

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "validated":
    case "validée":
    case "reçue":
    case "received":
      return "success";
    case "pending":
    case "en attente":
      return "warning";
    case "partial":
    case "partielle":
      return "light";
    case "late":
    case "retard":
      return "error";
    default:
      return "light";
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case "validated": return "Validée";
    case "received": return "Reçue";
    case "pending": return "En attente";
    case "partial": return "Partielle";
    case "late": return "En retard";
    default: return status;
  }
}

function getDeliveryStatus(daysSinceOrder: number): { label: string; color: string; icon: any } {
  if (daysSinceOrder < 0) return { label: "En avance", color: "text-emerald-600 bg-emerald-50", icon: TrendingUp };
  if (daysSinceOrder === 0) return { label: "À temps", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 };
  if (daysSinceOrder <= 3) return { label: "Retard léger", color: "text-amber-600 bg-amber-50", icon: Clock3 };
  if (daysSinceOrder <= 7) return { label: "Retard modéré", color: "text-orange-600 bg-orange-50", icon: AlertCircle };
  return { label: "Retard critique", color: "text-rose-600 bg-rose-50", icon: TriangleAlert };
}

function MiniStat({
  label,
  value,
  icon,
  trend,
  color = "light",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: "success" | "warning" | "error" | "light";
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
          <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-1.5 text-blue-600 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            }`}>
              <TrendingUp className={`h-3 w-3 ${!trend.isPositive && "rotate-180"}`} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <Badge size="sm" color={color as any}>
            {label}
          </Badge>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </div>
  );
}

export default function OrdersWidget() {
  const { data, isLoading, isError, error } = useOrdersWidget();
  const [expandedView, setExpandedView] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-32 rounded-lg bg-slate-200" />
              <div className="h-3 w-48 rounded-lg bg-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 rounded-xl bg-slate-100" />
            <div className="h-48 rounded-xl bg-slate-100" />
          </div>
          <div className="h-64 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 text-center shadow-lg border border-rose-200">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-sm font-medium text-rose-600">
          Erreur chargement des commandes
        </p>
        <p className="text-xs text-rose-500/70 mt-1">
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </p>
      </div>
    );
  }

  const totalOrders = data.total;
  const completionRate = totalOrders > 0 ? ((totalOrders - data.pending - data.late) / totalOrders) * 100 : 0;
  const lateRate = totalOrders > 0 ? (data.late / totalOrders) * 100 : 0;
  const pendingRate = totalOrders > 0 ? (data.pending / totalOrders) * 100 : 0;

  // Données pour le graphique en entonnoir (funnel)
  const funnelData = [
    { name: "Commandes totales", value: data.total, color: "#3b82f6" },
    { name: "En traitement", value: data.pending, color: "#f59e0b" },
    { name: "Partiellement reçues", value: data.partiallyReceived, color: "#8b5cf6" },
    { name: "Validées", value: data.total - data.pending - data.late - data.partiallyReceived, color: "#10b981" },
  ];

  // Données pour la timeline des commandes par jour
  const ordersByDate = data.recentOrders.reduce((acc: any, order) => {
    if (order.date) {
      const date = new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  const timelineData = Object.entries(ordersByDate).map(([date, count]) => ({ date, count }));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50/30 to-white p-6 shadow-xl border border-slate-100">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-40" />
            <div className="relative rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 p-2.5 shadow-md">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Gestion des commandes
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Suivi des commandes, réceptions et retards
            </p>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat
          label="Total"
          value={data.total}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
          color="light"
        />
        <MiniStat
          label="En attente"
          value={data.pending}
          icon={<Clock3 className="h-4 w-4" />}
          color={data.pending > 0 ? "warning" : "success"}
        />
        <MiniStat
          label="Partielles"
          value={data.partiallyReceived}
          icon={<PackageCheck className="h-4 w-4" />}
          color="light"
        />
        <MiniStat
          label="En retard"
          value={data.late}
          icon={<TriangleAlert className="h-4 w-4" />}
          color={data.late > 0 ? "error" : "success"}
        />
      </div>

      {/* Section visualisation - Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique en entonnoir - Funnel */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-100">
                <Gauge className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Entonnoir de traitement</span>
            </div>
          </div>
          <div className="space-y-3">
            {funnelData.map((item, idx) => {
              const percentage = totalOrders > 0 ? (item.value / totalOrders) * 100 : 0;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jauge de performance */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-100">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Performance des commandes</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Taux de complétion</span>
                <span className="font-medium text-emerald-600">{completionRate.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Taux de retard</span>
                <span className="font-medium text-rose-600">{lateRate.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-500" style={{ width: `${lateRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>En attente</span>
                <span className="font-medium text-amber-600">{pendingRate.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>
          </div>

          {/* Indicateur de santé global */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Santé des commandes</span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
                lateRate > 20 ? "bg-rose-100 text-rose-700" :
                lateRate > 10 ? "bg-amber-100 text-amber-700" :
                "bg-emerald-100 text-emerald-700"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  lateRate > 20 ? "bg-rose-500" :
                  lateRate > 10 ? "bg-amber-500" :
                  "bg-emerald-500"
                }`} />
                <span className="text-[10px] font-medium">
                  {lateRate > 20 ? "Critique" : lateRate > 10 ? "Attention" : "Stable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline des commandes */}
      {timelineData.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/30 to-white border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-slate-700">Activité des commandes</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {timelineData.slice(0, 7).map((item: any, idx: number) => (
              <div key={idx} className="flex-1 min-w-[60px] text-center group">
                <div className="text-[10px] font-medium text-slate-500 mb-1">{item.date}</div>
                <div className="relative h-12 flex items-end justify-center">
                  <div 
                    className="w-full max-w-[35px] mx-auto bg-gradient-to-t from-blue-400 to-indigo-400 rounded-lg transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-500"
                    style={{ height: `${Math.min(48, (item.count / Math.max(...timelineData.map((d: any) => d.count))) * 48)}px` }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-blue-600">{item.count}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-semibold text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count} cmd
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résumé des fournisseurs */}
      {data.recentOrders.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-50/30 to-white border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-purple-500" />
            <h4 className="text-sm font-semibold text-slate-700">Top fournisseurs</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {data.recentOrders.reduce((acc: any, order) => {
              const supplier = order.supplierName || "Autre";
              const existing = acc.find((item: any) => item.name === supplier);
              if (existing) {
                existing.count++;
              } else if (acc.length < 4) {
                acc.push({ name: supplier, count: 1 });
              }
              return acc;
            }, []).map((supplier: any, idx: number) => (
              <div key={idx} className="group relative overflow-hidden rounded-lg bg-white p-3 border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 truncate">{supplier.name}</span>
                  <Truck className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-800">{supplier.count}</p>
                <div className="mt-1 text-[10px] text-slate-400">
                  commande(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des commandes récentes */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-blue-100">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">
              Commandes récentes
            </h4>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {expandedView ? "Voir moins" : "Voir tout"}
            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expandedView ? "rotate-90" : ""}`} />
          </button>
        </div>

        <div className="max-w-full overflow-x-auto rounded-xl border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Commande
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Fournisseur
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Statut
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {data.recentOrders.length === 0 ? (
                <TableRow>
                  <td colSpan={4} className="py-6 text-sm text-slate-500 text-center">
                    Aucune commande récente.
                  </td>
                </TableRow>
              ) : (
                data.recentOrders.slice(0, expandedView ? undefined : 5).map((order) => {
                  const daysDelay = order.date ? Math.max(0, Math.floor((new Date().getTime() - new Date(order.date).getTime()) / (1000 * 60 * 60 * 24)) - 7) : 0;
                  const deliveryStatus = order.status === "late" ? getDeliveryStatus(daysDelay) : null;
                  const DeliveryIcon = deliveryStatus?.icon;
                  
                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {order.reference}
                          </p>
                          <span className="text-xs text-slate-400">
                            {order.totalLabel ?? "Commande"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {order.supplierName ?? "-"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600">
                            {order.date ? new Date(order.date).toLocaleDateString() : "-"}
                          </span>
                          {order.status === "late" && deliveryStatus && (
                            <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit ${deliveryStatus.color}`}>
                              {DeliveryIcon && <DeliveryIcon className="h-2.5 w-2.5" />}
                              <span>{deliveryStatus.label}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge size="sm" color={statusColor(order.status) as any}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400">Synchronisation en temps réel</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] text-slate-400">{data.total - data.pending - data.late - data.partiallyReceived} traitées</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-rose-500" />
            <span className="text-[10px] text-slate-400">{data.late} en retard</span>
          </div>
        </div>
      </div>
    </div>
  );
}