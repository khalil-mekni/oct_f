"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchEntrepots,
  createEntrepot,
  updateEntrepot,
  type Entrepot,
} from "@/lib/entrepot.api";
import { EntrepotSkeleton } from "@/components/entrepot/EntrepotSkeleton";
import EntrepotsFormModal from "@/components/entrepot/EntrepotsFormModal";
import { EntrepotsHeader } from "@/components/entrepot/EntrepotsHeader";
import { EntrepotsListView } from "@/components/entrepot/EntrepotsListView";
import { Warehouse, Package, Layers3, Boxes } from "lucide-react";

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

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

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
      } else {
        await createEntrepot({
          nom: formData.nom ?? "",
          adresse: formData.adresse ?? "",
          capacite_totale: Number(formData.capacite_totale ?? 0),
          statut: formData.statut ?? "ACTIVE",
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

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <EntrepotsHeader
        count={filteredItems.length}
        query={search}
        setQuery={setSearch}
        onOpenNew={handleOpenCreate}
        onRefresh={loadData}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <Warehouse size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Entrepôts affichés
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(stats.totalEntrepots)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <Layers3 size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Capacité totale
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(stats.capaciteTotale)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <Package size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Stock existant
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {formatNumber(stats.stockExistant)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-[#00A09D]">
              <Boxes size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Lots référencés
              </span>
            </div>
            <div className="text-3xl font-black text-[#00A09D]">
              {formatNumber(stats.totalLots)}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              Vue d’ensemble des entrepôts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Consultez les capacités, le stock disponible et les lots par
              entrepôt dans une vue tableau claire et professionnelle.
            </p>
          </div>

          {error ? (
            <div className="p-5">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                ⚠️ {error}
              </div>
            </div>
          ) : loading ? (
            <div className="p-4">
              <EntrepotSkeleton />
            </div>
          ) : (
            <EntrepotsListView rows={filteredItems} onEdit={handleOpenEdit} />
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