"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchEntrepots,
  updateEntrepot,
  type Entrepot,
} from "@/lib/entrepot.api";
import { EntrepotSkeleton } from "@/components/entrepot/EntrepotSkeleton";
import EntrepotsFormModal from "@/components/entrepot/EntrepotsFormModal";
import { EntrepotR } from "@/components/entrepot/entrepotheaderRS";
import { EntrepotsListView } from "@/components/entrepot/EntrepotsListView";
import {
  Warehouse,
  Package,
  Layers3,
  Boxes,
  ChevronRight,
} from "lucide-react";

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value ?? 0));
}

export default function EntrepotsPage() {
  const [items, setItems] = useState<Entrepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Entrepot | null>(null);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("highlight");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchEntrepots();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des entrepôts.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item: Entrepot) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: Partial<Entrepot>) => {
    try {
      setSaving(true);

      if (editingItem) {
        await updateEntrepot({
          id: editingItem.id,
          nom: formData.nom,
          adresse: formData.adresse,
          capacite_totale: formData.capacite_totale ?? null,
          statut: formData.statut,
        });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const lotsText = (item.entrepotLots ?? [])
        .map(
          (l) =>
            `${l.lot?.code_lot ?? ""} ${l.emballage?.code ?? ""} ${
              l.emballage?.name ?? ""
            } ${l.quantite ?? ""}`
        )
        .join(" ");

      const haystack = [
        item.nom,
        item.adresse,
        item.statut,
        String(item.capacite_totale ?? ""),
        String(item.stock_existant ?? ""),
        String(item.capacite_disponible ?? ""),
        lotsText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  const stats = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.totalEntrepots += 1;
        acc.capaciteTotale += Number(item.capacite_totale ?? 0);
        acc.stockExistant += Number(item.stock_existant ?? 0);
        acc.capaciteDisponible += Number(item.capacite_disponible ?? 0);
        acc.totalLots += item.entrepotLots?.length ?? 0;
        return acc;
      },
      {
        totalEntrepots: 0,
        capaciteTotale: 0,
        stockExistant: 0,
        capaciteDisponible: 0,
        totalLots: 0,
      }
    );
  }, [filteredItems]);

  useEffect(() => {
    if (!highlightedId || loading) return;

    const target = filteredItems.find(
      (item) => String(item.id) === String(highlightedId)
    );

    if (!target) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`entrepot-row-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [highlightedId, filteredItems, loading]);

  useEffect(() => {
    if (!highlightedId) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("highlight");

      const queryString = params.toString();
      router.replace(queryString ? `/entrepots?${queryString}` : "/entrepots");
    }, 2500);

    return () => clearTimeout(timer);
  }, [highlightedId, router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#F7FAFC] to-[#EEF4F8]">
      <EntrepotR
        count={filteredItems.length}
        query={search}
        setQuery={setSearch}
        onOpenNew={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        onRefresh={loadData}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div className="relative px-6 py-6 md:px-8 md:py-7">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00A09D]/[0.06] via-transparent to-slate-100 pointer-events-none" />

            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  <Warehouse size={14} />
                  Gestion logistique
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  Pilotage des entrepôts
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-[15px]">
                  Suivez l’état de vos entrepôts, consultez rapidement les
                  capacités disponibles et visualisez les lots stockés dans une
                  interface plus claire et plus élégante.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="rounded-xl bg-slate-100 p-2">
                  <ChevronRight className="text-slate-500" size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Résultat actuel
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatNumber(filteredItems.length)} entrepôt(s) affiché(s)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Warehouse size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Entrepôts
                </span>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(stats.totalEntrepots)}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Nombre total d’entrepôts visibles selon votre filtre.
            </p>
          </div>

          <div className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Layers3 size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Capacité totale
                </span>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(stats.capaciteTotale)}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Capacité cumulée de l’ensemble des entrepôts affichés.
            </p>
          </div>

          <div className="group rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                <Package size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Stock existant
                </span>
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {formatNumber(stats.stockExistant)}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Volume actuellement stocké dans les entrepôts listés.
            </p>
          </div>

          <div className="group rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00A09D]">
                <Boxes size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]">
                  Lots référencés
                </span>
              </div>
            </div>
            <div className="text-3xl font-black text-[#00A09D]">
              {formatNumber(stats.totalLots)}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Total des lots associés aux entrepôts actuellement visibles.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 md:px-6">
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">
              Vue d’ensemble des entrepôts
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Consultez les capacités, le stock disponible et les lots par
              entrepôt dans une vue tableau claire, moderne et professionnelle.
            </p>
          </div>

          {error ? (
            <div className="p-5">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                ⚠️ {error}
              </div>
            </div>
          ) : loading ? (
            <div className="p-4">
              <EntrepotSkeleton />
            </div>
          ) : (
            <div className="p-2 md:p-3">
              <EntrepotsListView
                rows={filteredItems}
                onEdit={handleOpenEdit}
                highlightedId={highlightedId}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EntrepotsFormModal
          editing={editingItem}
          onSave={handleSave}
          onClose={() => {
            if (saving) return;
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}