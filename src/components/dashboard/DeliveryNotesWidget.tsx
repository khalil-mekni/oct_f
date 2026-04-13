// DeliveryNotesWidget.tsx
"use client";

import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ClipboardCheck, Truck, CircleEllipsis, Warehouse, PackageCheck, Clock, TrendingUp, CheckCircle2, AlertCircle, Building2, ChevronRight, CalendarDays } from "lucide-react";
import { useDeliveryNotesWidget } from "@/hooks/useDeliveryNotesWidget";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "validé":
    case "valide":
    case "validated":
      return "success";
    case "en_attente":
    case "pending":
    case "en attente":
      return "warning";
    default:
      return "light";
  }
}

function getDaysSince(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
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
          <div className="rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 p-1.5 text-emerald-600 group-hover:scale-110 transition-transform">
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

export default function DeliveryNotesWidget() {
  const { data, isLoading, isError, error } = useDeliveryNotesWidget();
  const [expandedView, setExpandedView] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-lg bg-slate-200" />
              <div className="h-3 w-56 rounded-lg bg-slate-100" />
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
          Erreur chargement des bons de livraison
        </p>
        <p className="text-xs text-rose-500/70 mt-1">
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </p>
      </div>
    );
  }

  const validationRate = data.total > 0 ? (data.validated / data.total) * 100 : 0;
  const pendingRate = data.total > 0 ? (data.pending / data.total) * 100 : 0;

  // Données pour le graphique en anneau
  const pieData = [
    { name: "Validés", value: data.validated, color: "#10b981" },
    { name: "En attente", value: data.pending, color: "#f59e0b" },
  ];

  // Données pour le graphique par entrepôt
  const warehouseData = data.recentDeliveryNotes.reduce((acc: any, note) => {
    const warehouseName = note.entrepotName || "Non assigné";
    const existing = acc.find((item: any) => item.name === warehouseName);
    if (existing) {
      existing.count++;
      if (note.statut === "validé") existing.validated++;
    } else {
      acc.push({
        name: warehouseName,
        count: 1,
        validated: note.statut === "validé" ? 1 : 0,
      });
    }
    return acc;
  }, []);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50/30 to-white p-6 shadow-xl border border-slate-100">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-40" />
            <div className="relative rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-md">
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Bons de livraison
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Suivi des réceptions et validations
            </p>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat
          label="Total"
          value={data.total}
          icon={<Truck className="h-4 w-4" />}
          trend={{ value: 15, isPositive: true }}
          color="light"
        />
        <MiniStat
          label="Validés"
          value={data.validated}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          color="success"
        />
        <MiniStat
          label="En attente"
          value={data.pending}
          icon={<Clock className="h-4 w-4" />}
          color={data.pending > 0 ? "warning" : "success"}
        />
        <MiniStat
          label="Entrepôts"
          value={data.warehousesInvolved}
          icon={<Building2 className="h-4 w-4" />}
          color="light"
        />
      </div>

      {/* Section visualisation - Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique en anneau - Taux de validation */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-100">
                <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Taux de validation</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{validationRate.toFixed(0)}%</span>
          </div>
          <div className="h-32">
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
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500">Validés ({data.validated})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] text-slate-500">En attente ({data.pending})</span>
            </div>
          </div>
        </div>

        {/* Jauge de progression */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-teal-100">
                <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Performance globale</span>
            </div>
          </div>
          
          {/* Barre principale */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progression</span>
              <span>{validationRate.toFixed(0)}%</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div 
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
                style={{ width: `${validationRate}%` }}
              />
            </div>
          </div>

          {/* Barres secondaires */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                <span>Taux de validation</span>
                <span className="font-medium text-emerald-600">{validationRate.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${validationRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                <span>Taux en attente</span>
                <span className="font-medium text-amber-600">{pendingRate.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${pendingRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques par entrepôt */}
      {warehouseData.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Warehouse className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Activité par entrepôt</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {warehouseData.slice(0, 4).map((warehouse: any, idx: number) => (
              <div key={idx} className="group relative overflow-hidden rounded-lg bg-white p-3 border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 truncate">{warehouse.name}</span>
                  <Truck className="h-3 w-3 text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-800">{warehouse.count}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(warehouse.validated / warehouse.count) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-emerald-600">
                    {((warehouse.validated / warehouse.count) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline des récentes réceptions */}
      {data.recentDeliveryNotes.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50/30 to-white border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-indigo-500" />
            <h4 className="text-sm font-semibold text-slate-700">Timeline des réceptions</h4>
          </div>
          <div className="space-y-3">
            {data.recentDeliveryNotes.slice(0, 3).map((note, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${note.statut === "validé" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {idx < 2 && <div className="absolute top-2 left-0.5 w-0.5 h-6 bg-slate-200" />}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{note.numero_bl}</p>
                    <p className="text-xs text-slate-400">{note.entrepotName}</p>
                  </div>
                  <div className="text-right">
                    <Badge size="sm" color={statusColor(note.statut) as any}>
                      {note.statut}
                    </Badge>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {note.date_reception ? getDaysSince(note.date_reception) : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des BL récents */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-teal-100">
              <ClipboardCheck className="h-3.5 w-3.5 text-teal-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">
              Bons de livraison récents
            </h4>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
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
                  BL
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Entrepôt
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Réception
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Statut
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {data.recentDeliveryNotes.length === 0 ? (
                <TableRow>
                  <td colSpan={4} className="py-6 text-sm text-slate-500 text-center">
                    Aucun bon de livraison récent.
                  </td>
                </TableRow>
              ) : (
                data.recentDeliveryNotes.slice(0, expandedView ? undefined : 5).map((note) => (
                  <TableRow key={note.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-3">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">
                          {note.numero_bl}
                        </p>
                        <span className="text-xs text-slate-400">
                          {note.commandeReference ?? "Commande"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="h-3 w-3 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {note.entrepotName ?? "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">
                          {note.date_reception
                            ? new Date(note.date_reception).toLocaleDateString()
                            : "-"}
                        </span>
                        {note.date_reception && (
                          <span className="text-[10px] text-slate-400">
                            {getDaysSince(note.date_reception)}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <Badge size="sm" color={statusColor(note.statut) as any}>
                        {note.statut === "validé" ? "Validé" : 
                         note.statut === "en_attente" ? "En attente" : note.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
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
            <span className="text-[10px] text-slate-400">{data.validated} validés</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-slate-400">{data.pending} en attente</span>
          </div>
        </div>
      </div>
    </div>
  );
}