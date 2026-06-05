"use client";

import { Key, useState } from "react";
import { useRouter } from "next/navigation";
import { PredictionPoint, RecommandationAction } from "@/lib/predictionEmballageService";
import {
  ShoppingCart,
  ShieldCheck,
  PackageSearch,
  Banknote,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  ShieldAlert,
  Calculator,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface PredictionRecommendationProps {
  data: PredictionPoint[];
  granularity: "day" | "month" | "year";
  emballageId: number;
}

export default function PredictionRecommendation({
  data,
  granularity,
  emballageId,
}: PredictionRecommendationProps) {
  const [openMonths, setOpenMonths] = useState<string[]>([data[0]?.periode]);
  const router = useRouter();

  if (data.length === 0) return null;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  
  // Essayer de trouver le point du mois actuel, sinon prendre le premier
  const currentMonthPoint =
    data.find((d) => d.periode.startsWith(currentMonthStr)) || data[0];

  const isCurrentMonth = currentMonthPoint.periode.startsWith(currentMonthStr);
  const statusLabel = isCurrentMonth ? "Statut Mois Actuel" : "Statut de la période";
  
  const toggleMonth = (periode: string) => {
    setOpenMonths(prev => 
      prev.includes(periode) 
        ? prev.filter(p => p !== periode) 
        : [...prev, periode]
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(value);
  };

  const handleOrderNow = (rec: RecommandationAction) => {
    const params = new URLSearchParams({
      emballage_id: String(emballageId),
      quantite: String(rec.quantite),
      date_livraison: rec.date_suggeree,
    });
    router.push(`/commandes?${params.toString()}`);
  };

  // Regrouper les recommandations par mois pour éviter les doublons d'accordions en vue journalière
  const groupedRecs = data.reduce((acc, point) => {
    if (!point.recommandations_plan || point.recommandations_plan.length === 0)
      return acc;

    const monthKey = point.periode.substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = {
        periode: point.periode,
        unite: point.unite,
        prix_unitaire: point.prix_unitaire,
        recommandations_plan: [],
      };
    }
    // Éviter les recommandations identiques (même date et quantité)
    point.recommandations_plan.forEach((rec) => {
      const isDuplicate = acc[monthKey].recommandations_plan.some(
        (r: any) =>
          r.date_suggeree === rec.date_suggeree && r.quantite === rec.quantite
      );
      if (!isDuplicate) {
        acc[monthKey].recommandations_plan.push(rec);
      }
    });
    return acc;
  }, {} as Record<string, any>);

  const monthsWithRecs = Object.values(groupedRecs);

  return (
    <div className="fade-up relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-1 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-sky-200/20 lg:p-2" style={{ animationDelay: "150ms" }}>
      <div className="absolute -right-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-sky-300/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-96 w-96 animate-pulse rounded-full bg-teal-300/10 blur-[100px]" />

      <div className="relative overflow-hidden rounded-[2.2rem] bg-white/80 shadow-inner">
        <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400" />

        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-500 text-white shadow-xl shadow-sky-200 ring-4 ring-white">
                <Zap size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Plan d'Approvisionnement par Mois</h2>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Recommandations optimisées </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Current Month Status Card */}
            <div className="lg:col-span-1 space-y-6">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <Clock size={16} />
                Statut Mois Actuel
              </h3>
              
              <div className="oct-card bg-gradient-to-br from-white to-sky-50/30 p-6 space-y-5 border-sky-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Stock Existant</span>
                    <span className="font-black text-slate-900">{currentMonthPoint.stock_actuel} {currentMonthPoint.unite}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Réceptions Prévues</span>
                    <span className="font-black text-emerald-600">+{currentMonthPoint.receptions_futures_mois} {currentMonthPoint.unite}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-500">Conso. Prédite (J+1 à Fin)</span>
                    <span className="font-black text-rose-500">-{currentMonthPoint.consommation_restante_mois} {currentMonthPoint.unite}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-900">Bilan fin de mois</span>
                    <span className={`text-lg font-black ${currentMonthPoint.stock_restant_prevu < currentMonthPoint.stock_securite ? 'text-rose-600' : 'text-teal-600'}`}>
                      {currentMonthPoint.stock_restant_prevu} {currentMonthPoint.unite}
                    </span>
                  </div>
                </div>

                {currentMonthPoint.recommandations_plan && currentMonthPoint.recommandations_plan.length > 0 ? (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex gap-3">
                    <ShieldAlert className="text-rose-500 shrink-0" size={20} />
                    <p className="text-[10px] font-bold text-rose-700 leading-relaxed uppercase">
                      Stock insuffisant : Commande recommandée ci-contre.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3">
                    <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
                    <p className="text-[10px] font-bold text-emerald-700 leading-relaxed uppercase">
                      Stock sécurisé pour ce mois.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Grouped Recommendations by Month */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                <Calendar size={16} />
                Calendrier Prévisionnel
              </h3>

              <div className="space-y-3">
                {monthsWithRecs.length > 0 ? (
                  monthsWithRecs.map((month) => {
                    const isOpen = openMonths.includes(month.periode);
                    const monthLabel = new Date(month.periode).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                    
                    return (
                      <div key={month.periode} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md">
                        <button 
                          onClick={() => toggleMonth(month.periode)}
                          className="flex w-full items-center justify-between p-5 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isOpen ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Calendar size={18} />
                            </div>
                            <span className="text-sm font-black capitalize text-slate-800">{monthLabel}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-black text-teal-600 uppercase">
                              {month.recommandations_plan.length} commande(s)
                            </span>
                            {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="space-y-3 border-t border-slate-50 bg-slate-50/30 p-5 animate-in slide-in-from-top-2 duration-300">
                            {month.recommandations_plan.map((rec: any, idx: number) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                    <PackageSearch size={20} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-teal-600 uppercase">
                                        {new Date(rec.date_suggeree).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                                      </span>
                                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                                      <span className="text-[10px] font-bold text-slate-400">{rec.description}</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">
                                      Commander <span className="text-teal-600">{rec.quantite}</span> {month.unite}
                                    </p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleOrderNow(rec)}
                                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-teal-600 active:scale-95"
                                >
                                  Passer
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="oct-card p-10 text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={32} />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800">Tout est sous contrôle</p>
                    <p className="text-xs text-slate-500 mx-auto max-w-xs">
                      Aucune commande supplémentaire n'est requise pour les mois à venir selon les prévisions actuelles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                <Calculator size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investissement Total Suggéré</p>
                <p className="text-xl font-black text-slate-900">
                  {formatCurrency(data.reduce((sum, month) => sum + (month.recommandations_plan?.reduce((mSum, r) => mSum + (r.quantite * month.prix_unitaire), 0) || 0), 0))}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Info size={14} className="text-sky-400" />
              <span>Analysé sur {data.length} mois glissants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
