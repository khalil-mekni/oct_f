"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PredictionPoint } from "@/lib/predictionEmballageService";
import {
  ShoppingCart,
  ShieldCheck,
  PackageSearch,
  AlertTriangle,
  Banknote,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  ShieldAlert,
  Calculator,
  Calendar,
  Layers,
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
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  if (data.length === 0) return null;

  // On prend la première période pour la recommandation
  const point = data[0];

  // Trouver la période la plus critique (celle avec la plus grande quantité prédite)
  const criticalPoint = [...data].sort((a, b) => b.quantite_predite - a.quantite_predite)[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(value);
  };

  const handleOrderNow = () => {
    // Construction de l'URL de redirection avec les paramètres demandés
    const params = new URLSearchParams({
      emballage_id: String(emballageId),
      quantite: String(point.quantite_recommandee),
      prix_unitaire: String(point.prix_unitaire),
      cout_estime: String(point.cout_recommande),
    });

    // On utilise la route existante /commandes
    router.push(`/commandes?${params.toString()}`);
    };

  return (
    <div className="fade-up relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-1 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:shadow-sky-200/20 lg:p-2" style={{ animationDelay: "150ms" }}>
      {/* Animated background Blobs */}
      <div className="absolute -right-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-sky-300/10 blur-[100px]" />
      <div className="absolute -bottom-20 -left-20 h-96 w-96 animate-pulse rounded-full bg-teal-300/10 blur-[100px]" />

      <div className="relative overflow-hidden rounded-[2.2rem] bg-white/80 shadow-inner">
        {/* Banner decorative strip */}
        <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-400" />

        <div className="flex flex-col lg:flex-row">
          {/* Main Section */}
          <div className="flex-1 p-8 lg:p-12">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-cyan-500 text-white shadow-xl shadow-sky-200 ring-4 ring-white">
                  <ShoppingCart size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Plan d'Approvisionnement</h2>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Recommandation Smart-ML</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm border ${
                point.alerte_rupture
                  ? "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100"
              }`}>
                {point.alerte_rupture ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                {point.alerte_rupture ? "Risque de Rupture" : "Stock Sécurisé"}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1: Recommandation */}
              <div className="group relative overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-100/50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-sky-100 p-2.5 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <PackageSearch size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">À Commander</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tabular-nums tracking-tighter text-sky-900">
                    {point.quantite_recommandee.toLocaleString("fr-FR")}
                  </span>
                  <span className="text-sm font-bold text-sky-600">{point.unite}</span>
                </div>
                <div className="mt-4 h-1.5 w-full rounded-full bg-sky-100/50 overflow-hidden">
                   <div className="h-full bg-sky-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Card 2: Coût */}
              <div className="group relative overflow-hidden rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50/50 to-white p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-100/50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-teal-100 p-2.5 text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <Banknote size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">Budget Estimé</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tabular-nums tracking-tighter text-teal-900">
                    {formatCurrency(point.cout_recommande)}
                  </span>
                </div>
                <p className="mt-4 text-[11px] font-medium text-slate-500">
                  Base: <span className="font-bold text-teal-700">{point.prix_unitaire} TND</span> / {point.unite.slice(0, -1)}
                </p>
              </div>

              {/* Card 3: Stock Actuel vs Sécurité */}
              <div className="group relative overflow-hidden rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-white p-7 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-100/50">
                 <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-xl bg-cyan-100 p-2.5 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    <Layers size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Niveau de Stock</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Actuel</span>
                    <span className="font-black text-slate-900">{point.stock_actuel} {point.unite}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Sécurité</span>
                    <span className="font-black text-cyan-600">{point.stock_securite} {point.unite}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${point.stock_actuel < point.stock_securite ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                         style={{ width: `${Math.min((point.stock_actuel / (point.stock_securite * 2)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={handleOrderNow}
                className="flex flex-[2] items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-slate-200 transition-all hover:bg-sky-600 hover:shadow-sky-200 active:scale-[0.98]"
              >
                <ShoppingCart size={18} />
                Commander Maintenant
              </button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex flex-1 items-center justify-center gap-3 rounded-[1.5rem] border-2 border-slate-200 bg-white py-5 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:border-teal-400 hover:text-teal-600"
              >
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                Voir le plan complet
              </button>
            </div>
          </div>

          {/* Side Info Panel */}
          <div className="bg-slate-50/50 p-8 lg:w-96 lg:border-l lg:border-slate-100 lg:p-12">
            <h3 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <TrendingUp size={16} />
              Résumé Prévisionnel
            </h3>

            <div className="space-y-8">
              <div className="relative pl-6 border-l-2 border-sky-200">
                <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-sky-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consommation Attendue</p>
                <p className="text-lg font-black text-slate-900">{point.quantite_predite} <span className="text-xs text-slate-400">{point.unite}</span></p>
              </div>

              <div className="relative pl-6 border-l-2 border-teal-200">
                <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-teal-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Restant Prévu</p>
                <p className={`text-lg font-black ${point.alerte_rupture ? 'text-rose-600' : 'text-slate-900'}`}>
                  {point.stock_restant_prevu} <span className="text-xs text-slate-400">{point.unite}</span>
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                  <Zap size={14} fill="currentColor" />
                  Insight IA
                </div>
                <p className="text-xs leading-relaxed font-medium text-slate-600 italic">
                  "Le pic de consommation est attendu pour la période du <span className="font-bold text-slate-900">{new Date(criticalPoint.periode).toLocaleDateString("fr-FR", { month: "long" })}</span> avec <span className="font-bold text-slate-900">{criticalPoint.quantite_predite} unités</span>."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section (Expandable) */}
        {showDetails && (
          <div className="animate-in slide-in-from-top duration-500 border-t border-slate-100 bg-slate-50/30 p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-2">
              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                  <Calculator size={18} className="text-sky-500" />
                  Détail du calcul
                </h4>
                <div className="rounded-[1.5rem] bg-white p-6 space-y-4 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Formule utilisée</span>
                    <code className="bg-slate-100 px-2 py-1 rounded text-sky-600 font-bold text-[10px]">
                      Qte = max(0, Pred + Secu - Actuel)
                    </code>
                  </div>
                  <div className="h-px bg-slate-50 w-full" />
                  <p className="text-xs leading-relaxed text-slate-600">
                    Nous calculons la recommandation en sommant la <strong>consommation prédite</strong> ({point.quantite_predite}) et le <strong>stock de sécurité</strong> ({point.stock_securite}), puis en soustrayant le <strong>stock actuel</strong> ({point.stock_actuel}).
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Le stock de sécurité est fixé à <strong>20%</strong> de la consommation prévue pour pallier aux aléas logistiques.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900">
                  <Calendar size={18} className="text-teal-500" />
                  Période la plus critique
                </h4>
                <div className="rounded-[1.5rem] bg-white p-6 space-y-4 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Mois</span>
                    <span className="text-sm font-black text-slate-900 capitalize">
                      {new Date(criticalPoint.periode).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Quantité Prévue</span>
                    <span className="text-sm font-black text-sky-600">{criticalPoint.quantite_predite} {point.unite}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Statut du risque</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${criticalPoint.alerte_rupture ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {criticalPoint.alerte_rupture ? "Rupture Probable" : "Gérable"}
                    </span>
                  </div>
                  <div className="h-px bg-slate-50 w-full" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">Investissement Total Recommandé</span>
                    <span className="text-lg font-black text-teal-600">{formatCurrency(point.cout_recommande)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
