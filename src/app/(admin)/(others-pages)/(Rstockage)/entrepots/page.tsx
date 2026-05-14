"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { EntrepotsPagination } from "@/components/entrepot/Entrepotspagination";
import {
  Warehouse,
  Package,
  Layers3,
  Boxes,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

function fmt(value?: number | null) {
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

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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
          statut: formData.statut ?? "ACTIF",
        });
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
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

  useEffect(() => {
    setPage(1);
  }, [search]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, page, perPage]);

  const stats = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.totalEntrepots += 1;
        acc.capaciteTotale += Number(item.capacite_totale ?? 0);
        acc.stockExistant += Number(item.stock_existant ?? 0);
        acc.capaciteDisponible += Number(item.capacite_disponible ?? 0);
        acc.totalLots += item.entrepotLots?.length ?? 0;

        const statut = (item.statut ?? "").toUpperCase();
        acc.actifs += statut === "ACTIVE" || statut === "ACTIF" ? 1 : 0;

        return acc;
      },
      {
        totalEntrepots: 0,
        capaciteTotale: 0,
        stockExistant: 0,
        capaciteDisponible: 0,
        totalLots: 0,
        actifs: 0,
      }
    );
  }, [filteredItems]);

  const globalOccupation =
    stats.capaciteTotale > 0
      ? Math.round((stats.stockExistant / stats.capaciteTotale) * 100)
      : 0;

  useEffect(() => {
    if (!highlightedId || loading) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`entrepot-row-${highlightedId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);

    return () => clearTimeout(timer);
  }, [highlightedId, filteredItems, loading]);

  useEffect(() => {
    if (!highlightedId) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("highlight");

      const qs = params.toString();
      router.replace(qs ? `/entrepots?${qs}` : "/entrepots");
    }, 2500);

    return () => clearTimeout(timer);
  }, [highlightedId, router, searchParams]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-gray-950">
      <EntrepotsHeader
        count={filteredItems.length}
        query={search}
        setQuery={setSearch}
        onOpenNew={handleOpenCreate}
        onRefresh={loadData}
        loading={loading}
      />

      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {[
            {
              label: "Entrepôts",
              value: fmt(stats.totalEntrepots),
              sub: `${stats.actifs} actif(s)`,
              icon: <Warehouse size={17} className="text-[#00A09D]" />,
              iconBg: "bg-[#00A09D]/10",
              color: "text-[#1C2434] dark:text-white",
              border: "border-[#00A09D]/10",
            },
            {
              label: "Capacité totale",
              value: fmt(stats.capaciteTotale),
              sub: "unités cumulées",
              icon: <Layers3 size={17} className="text-violet-500" />,
              iconBg: "bg-violet-50",
              color: "text-[#1C2434] dark:text-white",
              border: "border-violet-100",
            },
            {
              label: "Stock existant",
              value: fmt(stats.stockExistant),
              sub: "unités en stock",
              icon: <Package size={17} className="text-[#00A09D]" />,
              iconBg: "bg-[#00A09D]/10",
              color: "text-[#00A09D]",
              border: "border-[#00A09D]/10",
            },
            {
              label: "Capacité dispo",
              value: fmt(stats.capaciteDisponible),
              sub: "unités disponibles",
              icon: <TrendingUp size={17} className="text-amber-500" />,
              iconBg: "bg-amber-50",
              color: "text-amber-600",
              border: "border-amber-100",
            },
            {
              label: "Lots référencés",
              value: fmt(stats.totalLots),
              sub: "lots totaux",
              icon: <Boxes size={17} className="text-[#00A09D]" />,
              iconBg: "bg-[#00A09D]/10",
              color: "text-[#00A09D]",
              border: "border-[#00A09D]/10",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-2xl border bg-white px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 ${s.border} dark:border-gray-800`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {s.label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.iconBg}`}
                >
                  {s.icon}
                </div>
              </div>

              <p
                className={`mt-2 font-mono text-2xl font-[1000] tracking-tighter ${s.color}`}
              >
                {s.value}
              </p>

              <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                {s.sub}
              </p>

              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
            </div>
          ))}
        </div>

        {stats.capaciteTotale > 0 && (
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="shrink-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Occupation globale
              </p>

              <p
                className={`font-mono text-2xl font-[1000] tracking-tighter ${
                  globalOccupation >= 90
                    ? "text-red-500"
                    : globalOccupation >= 70
                      ? "text-amber-500"
                      : "text-[#00A09D]"
                }`}
              >
                {globalOccupation}%
              </p>
            </div>

            <div className="flex-1">
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    globalOccupation >= 90
                      ? "bg-red-500"
                      : globalOccupation >= 70
                        ? "bg-amber-500"
                        : "bg-[#00A09D]"
                  }`}
                  style={{ width: `${globalOccupation}%` }}
                />
              </div>
            </div>

            {globalOccupation >= 90 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500">
                <AlertTriangle size={12} />
                Capacité critique
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="flex items-center gap-2 text-base font-[1000] uppercase tracking-tight text-[#1C2434] dark:text-white">
                <Warehouse size={16} className="text-[#00A09D]" />
                Vue d&apos;ensemble
                <span className="text-[#00A09D]">.</span>
              </h2>

              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                {filteredItems.length} entrepôt
                {filteredItems.length !== 1 ? "s" : ""} affiché
                {filteredItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <EntrepotSkeleton />
          ) : (
            <EntrepotsListView
              rows={paginatedItems}
              onEdit={handleOpenEdit}
              highlightedId={highlightedId}
            />
          )}

          {!loading && (
            <EntrepotsPagination
              page={page}
              perPage={perPage}
              total={filteredItems.length}
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <EntrepotsFormModal
          editing={editingItem}
          saving={saving}
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