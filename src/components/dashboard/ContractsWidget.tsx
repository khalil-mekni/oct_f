// ContractsWidget.tsx
"use client";

import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FileText, ShieldAlert, CalendarClock, CircleCheckBig, TrendingUp, AlertCircle, Clock, Building2, ChevronRight } from "lucide-react";
import { useContractsWidget } from "@/hooks/useContractsWidget";
import { useState } from "react";

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "active":
    case "actif":
      return "success";
    case "expired":
    case "expire":
    case "expiré":
      return "error";
    case "pending":
    case "draft":
    case "brouillon":
      return "warning";
    default:
      return "light";
  }
}

function getDaysRemaining(endDate: string): { days: number; label: string; color: string } {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { days: diffDays, label: "Expiré", color: "text-rose-600 bg-rose-50" };
  if (diffDays <= 7) return { days: diffDays, label: "Urgent", color: "text-rose-600 bg-rose-50" };
  if (diffDays <= 30) return { days: diffDays, label: "Proche", color: "text-amber-600 bg-amber-50" };
  if (diffDays <= 90) return { days: diffDays, label: "Normal", color: "text-emerald-600 bg-emerald-50" };
  return { days: diffDays, label: "Lointain", color: "text-slate-600 bg-slate-50" };
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
          <div className="rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 p-1.5 text-slate-500 group-hover:scale-110 transition-transform">
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

export default function ContractsWidget() {
  const { data, isLoading, isError, error } = useContractsWidget();
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
          <div className="h-64 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 text-center shadow-lg border border-amber-200">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-amber-600">
          Erreur chargement des contrats
        </p>
        <p className="text-xs text-amber-500/70 mt-1">
          {error instanceof Error ? error.message : "Erreur inconnue"}
        </p>
      </div>
    );
  }

  // Calcul des statistiques supplémentaires
  const activeRate = (data.activeContracts / data.totalContracts) * 100;
  const expiringRate = (data.expiringSoon / data.totalContracts) * 100;
  
  // Données pour la visualisation des échéances
  const contractsByMonth = data.recentContracts.reduce((acc: any, contract) => {
    if (contract.endDate) {
      const month = new Date(contract.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const timelineData = Object.entries(contractsByMonth).map(([month, count]) => ({ month, count }));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-slate-50/30 to-white p-6 shadow-xl border border-slate-100">
      {/* En-tête avec icône animée */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-40" />
            <div className="relative rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Gestion des contrats
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Synthèse complète et suivi des échéances
            </p>
          </div>
        </div>
      </div>

      {/* Cartes statistiques modernisées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat
          label="Total"
          value={data.totalContracts}
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          color="light"
        />
        <MiniStat
          label="Actifs"
          value={data.activeContracts}
          icon={<CircleCheckBig className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
          color="success"
        />
        <MiniStat
          label="Expiration proche"
          value={data.expiringSoon}
          icon={<Clock className="h-4 w-4" />}
          color={data.expiringSoon > 0 ? "warning" : "success"}
        />
        <MiniStat
          label="Alertes"
          value={data.contractAlerts}
          icon={<ShieldAlert className="h-4 w-4" />}
          color={data.contractAlerts > 0 ? "error" : "success"}
        />
      </div>

      {/* Section visualisation - Graphique d'échéances et barres de progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Barre de progression des contrats actifs */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-100">
                <CircleCheckBig className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Taux d'activité</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{activeRate.toFixed(0)}%</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
              style={{ width: `${activeRate}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-400">Inactifs: {data.totalContracts - data.activeContracts}</span>
            <span className="text-[10px] text-slate-400">Actifs: {data.activeContracts}</span>
          </div>
        </div>

        {/* Barre de progression des expirations */}
        <div className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-100">
                <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Expirations proches</span>
            </div>
            <span className={`text-sm font-bold ${data.expiringSoon > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {expiringRate.toFixed(0)}%
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
                data.expiringSoon > 0 
                  ? "bg-gradient-to-r from-amber-400 to-orange-500" 
                  : "bg-gradient-to-r from-emerald-400 to-teal-500"
              }`}
              style={{ width: `${expiringRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-400">Expirés: {data.contractAlerts}</span>
            <span className="text-[10px] text-slate-400">Bientôt: {data.expiringSoon}</span>
          </div>
        </div>
      </div>

      {/* Timeline des échéances - Nouvelle visualisation */}
      {timelineData.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Calendrier des échéances</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {timelineData.slice(0, 6).map((item: any, idx: number) => (
              <div key={idx} className="flex-1 min-w-[80px] text-center group">
                <div className="text-[10px] font-medium text-slate-500 mb-1">{item.month}</div>
                <div className="relative h-16 flex items-end justify-center">
                  <div 
                    className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-indigo-400 to-purple-400 rounded-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-500"
                    style={{ height: `${Math.min(60, (item.count / Math.max(...timelineData.map((d: any) => d.count))) * 60)}px` }}
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-indigo-600">{item.count}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-semibold text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count} contrat(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des contrats récents avec design amélioré */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-100">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">
              Derniers contrats
            </h4>
          </div>
          <button
            onClick={() => setExpandedView(!expandedView)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
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
                  Référence
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Partenaire
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Échéance
                </TableCell>
                <TableCell isHeader className="py-3 text-start text-xs font-semibold text-slate-600">
                  Statut
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {data.recentContracts.length === 0 ? (
                <TableRow>
                  <td colSpan={4} className="py-6 text-sm text-slate-500 text-center">
                    Aucun contrat récent.
                  </td>
                </TableRow>
              ) : (
                data.recentContracts.slice(0, expandedView ? undefined : 5).map((contract) => {
                  const daysInfo = contract.endDate ? getDaysRemaining(contract.endDate) : null;
                  return (
                    <TableRow key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-3">
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {contract.reference}
                          </p>
                          <span className="text-xs text-slate-400">
                            {contract.title ?? "Contrat"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-sm text-slate-600">
                        {contract.partnerName ?? "-"}
                      </TableCell>

                      <TableCell className="py-3">
                        {contract.endDate ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-600">
                              {new Date(contract.endDate).toLocaleDateString()}
                            </span>
                            {daysInfo && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block w-fit ${daysInfo.color}`}>
                                {daysInfo.label} ({daysInfo.days}j)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge size="sm" color={statusColor(contract.status) as any}>
                          {contract.status === "active" ? "Actif" : 
                           contract.status === "expired" ? "Expiré" :
                           contract.status === "pending" ? "En attente" : contract.status}
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

      {/* Pied de page avec indicateur de mise à jour */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400">Données en temps réel</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}