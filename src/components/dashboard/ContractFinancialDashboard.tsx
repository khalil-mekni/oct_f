"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { useContractsWidget } from "@/hooks/useContractsWidget";
import { useRefreshContratStatuts } from "@/hooks/useContrats";
import { Contrat } from "@/types/contrat";
import Badge from "../ui/badge/Badge";
import { useRouter } from "next/navigation";

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatDT = (val: number) =>
  new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(val);

const calculateExecutionRate = (realisee: number, contractuelle: number) => {
  if (!contractuelle) return 0;
  return Math.min(Math.round((realisee / contractuelle) * 100), 120); // Cap at 120% for visual
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "EXPIRE":
      return { label: "Expiré", color: "text-rose-600", bg: "bg-rose-500/10", icon: AlertCircle, border: "border-rose-200 dark:border-rose-500/20" };
    case "SUSPENDU":
      return { label: "Suspendu", color: "text-amber-600", bg: "bg-amber-500/10", icon: AlertTriangle, border: "border-amber-200 dark:border-amber-500/20" };
    case "ACTIF":
    default:
      return { label: "Actif", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: CheckCircle2, border: "border-emerald-200 dark:border-emerald-500/20" };
  }
};

const TNDIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center text-lg font-black tracking-tighter`}>
    DT
  </div>
);

// ─── Sub-Components ────────────────────────────────────────────────────────
const MetricCard = ({ title, value, subValue, icon: Icon, colorClass, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
    className="relative overflow-hidden bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm group"
  >
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black mt-2 text-slate-900 dark:text-white tabular-nums">{value}</h3>
        {subValue && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{subValue}</span>
          </div>
        )}
      </div>
      <div className="transition-transform group-hover:scale-110 pt-1">
        <Icon className={`w-8 h-8 ${colorClass.replace("bg-", "text-")}`} />
      </div>
    </div>
  </motion.div>
);

export default function ContractFinancialDashboard() {
  const router = useRouter();
  const { data: widgetData, isLoading: widgetLoading } = useContractsWidget();
  const { data: contratsData, isLoading: contratsLoading } = useRefreshContratStatuts();
  const [showAll, setShowAll] = useState(false);

  const contrats = useMemo(() => {
    // We sort contracts to have those with issues or most recent at the top
    const raw = contratsData?.refreshContratStatuts || [];
    return [...raw].sort((a, b) => {
      if (a.statut === 'EXPIRE' && b.statut !== 'EXPIRE') return -1;
      if (a.statut !== 'EXPIRE' && b.statut === 'EXPIRE') return 1;
      return 0;
    });
  }, [contratsData]);
  
  const stats = useMemo(() => {
    if (!contrats.length) return {
      totalAmount: 0,
      totalConsumed: 0,
      remainingBudget: 0,
      globalExecutionRate: 0,
    };

    const totalAmount = contrats.reduce((sum, c) => {
        const amount = Number(c.montant_ht) || (Number(c.quantite_contractuelle || 0) * Number(c.prix_unitaire || 0));
        return sum + amount;
    }, 0);

    const totalConsumed = contrats.reduce((sum, c) => {
        const consumed = Number(c.quantite_realisee || 0) * Number(c.prix_unitaire || 0);
        return sum + consumed;
    }, 0);
    
    const globalExecutionRate = totalAmount > 0 ? (totalConsumed / totalAmount) * 100 : 0;
    
    return {
      totalAmount,
      totalConsumed,
      remainingBudget: totalAmount - totalConsumed,
      globalExecutionRate: Math.round(globalExecutionRate),
    };
  }, [contrats]);

  // Identifie les contrats avec des alertes (consommation > 90% ou expiration imminente)
  const alertContracts = useMemo(() => {
    return contrats.filter(c => {
      const rate = calculateExecutionRate(c.quantite_realisee || 0, c.quantite_contractuelle);
      const daysRemaining = c.date_fin ? Math.ceil((new Date(c.date_fin).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
      return rate >= 90 || (daysRemaining !== null && daysRemaining <= 30) || c.statut === 'EXPIRE';
    });
  }, [contrats]);

  const distributionData = useMemo(() => {
    const map: Record<string, number> = {};
    contrats.forEach(c => {
      const type = c.emballage?.name || "Autres";
      map[type] = (map[type] || 0) + (c.montant_ht || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [contrats]);

  if (widgetLoading || contratsLoading) {
    return (
      <div className="mt-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-slate-100 dark:bg-white/5 rounded-3xl" />
          <div className="h-[400px] bg-slate-100 dark:bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const displayedContrats = showAll ? contrats : contrats.slice(0, 5);

  return (
    <div className="space-y-8 mt-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Suivi des Contrats</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Analyse en temps réel des engagements contractuels</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <History className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Dernière Mise à Jour: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── Global KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Montant Total Engagé"
          value={formatDT(stats?.totalAmount || 0)}
          subValue={`${widgetData?.totalContracts || 0} contrats actifs`}
          icon={TNDIcon}
          colorClass="bg-blue-500"
          delay={0.1}
        />
        <MetricCard
          title="Consommation Réelle"
          value={formatDT(stats?.totalConsumed || 0)}
          subValue={`${stats?.globalExecutionRate || 0}% de taux moyen`}
          icon={TrendingUp}
          colorClass="bg-emerald-500"
          delay={0.2}
        />
        <MetricCard
          title="Budget Restant"
          value={formatDT(stats?.remainingBudget || 0)}
          subValue="Disponible pour commandes"
          icon={Wallet}
          colorClass="bg-indigo-500"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Main List of Real Contracts ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Détails des Contrats Actifs</h3>
              <p className="text-xs text-slate-500 mt-1">Suivi individuel des consommations et quantités</p>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className={`overflow-x-auto transition-all duration-500 ${showAll ? "max-h-[600px] overflow-y-auto" : ""}`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Référence / Fournisseur</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Progression Qty</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Budget (HT)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayedContrats.map((contrat) => {
                  const rate = calculateExecutionRate(contrat.quantite_realisee || 0, contrat.quantite_contractuelle);
                  const daysRemaining = contrat.date_fin ? Math.ceil((new Date(contrat.date_fin).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                  const cfg = getStatusConfig(contrat.statut);
                  const Icon = cfg.icon;
                  const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30 && contrat.statut === 'ACTIF';

                  return (
                    <motion.tr 
                      key={contrat.id}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                      className={`group transition-colors cursor-pointer ${
                        daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 10 && contrat.statut === 'ACTIF'
                          ? "border-l-4 border-l-rose-500 bg-rose-50/10 dark:bg-rose-500/5"
                          : ""
                      }`}
                      onClick={() => router.push(`/contrats?search=${contrat.numero_contrat}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                            {isExpiringSoon && (
                              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${daysRemaining <= 10 ? "bg-rose-400" : "bg-amber-400"}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${daysRemaining <= 10 ? "bg-rose-500" : "bg-amber-500"}`}></span>
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{contrat.numero_contrat}</p>
                              {isExpiringSoon && (
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${
                                  daysRemaining <= 10 
                                    ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" 
                                    : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
                                }`}>
                                  <Clock className={`w-2.5 h-2.5 ${daysRemaining <= 10 ? "text-rose-600" : "text-amber-600"}`} />
                                  <span className={`text-[9px] font-black uppercase tracking-tight ${daysRemaining <= 10 ? "text-rose-600" : "text-amber-600"}`}>J-{daysRemaining}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{contrat.fournisseur?.raison_sociale}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">{contrat.quantite_realisee?.toLocaleString()} / {contrat.quantite_contractuelle.toLocaleString()}</span>
                            <span className={rate > 90 ? "text-rose-500" : "text-blue-500"}>{rate}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${rate}%` }}
                              className={`h-full rounded-full ${rate > 90 ? "bg-rose-500" : "bg-blue-500"} shadow-sm`}
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="px-1.5 py-0 text-[9px] uppercase font-bold">
                              <Badge color="light">{contrat.commandes_count || 0} Cmds</Badge>
                            </div>
                            <div className="px-1.5 py-0 text-[9px] uppercase font-bold">
                              <Badge color="light">{contrat.bon_livraisons_count || 0} BL</Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{formatDT(contrat.montant_ht || 0)}</p>
                        <p className="text-[10px] font-bold text-slate-400">Reste: {formatDT((contrat.montant_ht || 0) - (contrat.quantite_realisee || 0) * (contrat.prix_unitaire || 0))}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {contrats.length > 5 && (
             <div className="px-6 py-4 bg-slate-50/30 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
               <button 
                 onClick={() => setShowAll(!showAll)}
                 className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest flex items-center gap-2"
               >
                 {showAll ? "Réduire la liste" : `Afficher les ${contrats.length - 5} autres contrats`}
                 <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : "-rotate-90"}`} />
               </button>
               <button 
                 onClick={() => router.push("/contrats")}
                 className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest flex items-center gap-1"
               >
                 Aller à la page dédiée <ExternalLink className="w-3 h-3" />
               </button>
             </div>
          )}
        </motion.div>

        {/* ── Side: Distribution & Alerts ── */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Engagement par Type</h3>
            <p className="text-xs text-slate-500 mb-6">Répartition financière par catégorie d&apos;emballage</p>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(15, 23, 42, 0.9)", 
                      borderRadius: "16px", 
                      border: "none", 
                      color: "#fff",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)"
                    }}
                    itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                    formatter={(val: number) => formatDT(val)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white">{formatDT(stats?.totalAmount || 0).split(',')[0]} DT</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {distributionData.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{Math.round((item.value / (stats?.totalAmount || 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* New White Alert Panel with Red Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
               <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
               <h3 className="font-black text-lg text-rose-600 dark:text-rose-400">Anomalies de Vigilance</h3>
            </div>
            <div className="space-y-4">
               {alertContracts.length === 0 ? (
                 <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-50" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Aucune anomalie critique</p>
                 </div>
               ) : (
                 alertContracts.slice(0, 3).map((c, i) => {
                    const rate = calculateExecutionRate(c.quantite_realisee || 0, c.quantite_contractuelle);
                    const daysRemaining = c.date_fin ? Math.ceil((new Date(c.date_fin).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                    const isCritical = rate >= 90 || c.statut === 'EXPIRE' || (daysRemaining !== null && daysRemaining <= 10);
                    
                    return (
                      <motion.div 
                        key={c.id}
                        whileHover={{ scale: 1.01, x: 3 }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all group ${
                          isCritical 
                            ? "bg-rose-50/50 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20" 
                            : "bg-amber-50/50 border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20"
                        }`}
                        onClick={() => router.push(`/contrats?search=${c.numero_contrat}`)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isCritical ? "text-rose-600" : "text-amber-600"}`}>
                            {isCritical ? (c.statut === 'EXPIRE' ? "Expiré" : (daysRemaining !== null && daysRemaining <= 10 ? "Expiration Imminente" : "Critique")) : "Urgent"}
                          </span>
                          <ExternalLink className={`w-3 h-3 ${isCritical ? "text-rose-400" : "text-amber-400"}`} />
                        </div>
                        <p className={`text-xs font-black mb-0.5 ${isCritical ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>
                          {c.numero_contrat}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                          {isCritical 
                            ? (daysRemaining !== null && daysRemaining <= 10 && c.statut !== 'EXPIRE' 
                                ? `Plus que ${daysRemaining} jours restants !` 
                                : `Seuil de ${rate}% dépassé - ${c.fournisseur?.raison_sociale}`)
                            : `Expire dans ${daysRemaining} jours - ${c.fournisseur?.raison_sociale}`}
                        </p>
                      </motion.div>
                    );
                 })
               )}
               {alertContracts.length > 3 && (
                 <button 
                  onClick={() => router.push("/contrats")}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
                 >
                   Voir les {alertContracts.length} alertes
                 </button>
               )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}