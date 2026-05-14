"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createInventaire,
  deleteInventaire,
  listInventaires,
  normalizeInventaire,
  updateInventaire,
} from "@/lib/inventaire.api";
import { TableInventaire, InventaireFilters } from "@/types/inventaire";
import InventaireHeader from "@/components/inventaire/InventaireHeader";
import InventaireStats from "@/components/inventaire/InventaireStats";
import InventaireFiltersBar from "@/components/inventaire/InventaireFilters";
import InventaireCriticalPanel from "@/components/inventaire/InventaireCriticalPanel";
import InventaireAuditCards from "@/components/inventaire/InventaireAuditCards";
import InventaireDetailDrawer from "@/components/inventaire/InventaireDetailDrawer";
import InventaireFormDrawer from "@/components/inventaire/InventaireFormDrawer";
import { fetchEntrepots } from "@/lib/entrepot.api";
import { listEmballages } from "@/lib/emballages.api";

const toBackendDateTime = (value?: string | null) => {
  if (!value) return undefined;

  if (value.includes("T")) {
    return `${value}:00`.replace("T", " ");
  }

  return value;
};

export default function InventairePage() {
  const [data, setData] = useState<TableInventaire[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<InventaireFilters>({
    search: "",
    status: "all",
    entrepot: "",
  });

  const [selected, setSelected] = useState<TableInventaire | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TableInventaire | null>(null);

  const [entrepotsOptions, setEntrepotsOptions] = useState<
    { id: string; label: string }[]
  >([]);

  const [emballagesOptions, setEmballagesOptions] = useState<
    { id: string; label: string }[]
  >([]);

  const load = async () => {
    setLoading(true);

    try {
      const [inventairesRes, entrepotsRes, emballagesRes] = await Promise.all([
        listInventaires(),
        fetchEntrepots(),
        listEmballages(1, 100),
      ]);

      setData(inventairesRes.map(normalizeInventaire));

      setEntrepotsOptions(
        entrepotsRes.map((e) => ({
          id: String(e.id),
          label: e.nom,
        }))
      );

      setEmballagesOptions(
        emballagesRes.emballages.data.map((e) => ({
          id: String(e.id),
          label: e.name,
        }))
      );
    } catch (error) {
      console.error("Erreur chargement inventaire:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let rows = [...data];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.emballage_name.toLowerCase().includes(q) ||
          r.entrepot_name.toLowerCase().includes(q)
      );
    }

    if (filters.entrepot) {
      rows = rows.filter((r) => r.entrepot_id === filters.entrepot);
    }

    if (filters.status === "perfect") {
      rows = rows.filter((r) => Number(r.ecart) === 0);
    } else if (filters.status === "negative") {
      rows = rows.filter((r) => Number(r.ecart) < 0);
    } else if (filters.status === "positive") {
      rows = rows.filter((r) => Number(r.ecart) > 0);
    }

    return rows.sort((a, b) => Math.abs(Number(b.ecart)) - Math.abs(Number(a.ecart)));
  }, [data, filters]);

  const criticalCount = data.filter((i) => Math.abs(Number(i.ecart)) > 0).length;

  const handleQuickAdjust = async (id: string, newVal: number) => {
    await updateInventaire(id, { stock_physique: newVal });
    await load();
  };

  const handleCreate = async (payload: any) => {
    await createInventaire({
      ...payload,
      date_inventaire: toBackendDateTime(payload.date_inventaire)!,
      periode_debut: toBackendDateTime(payload.periode_debut),
      periode_fin: toBackendDateTime(payload.periode_fin),
    });

    await load();
  };

  const handleEdit = async (payload: any) => {
    if (!editing) return;

    await updateInventaire(editing.id, {
      ...payload,
      date_inventaire: toBackendDateTime(payload.date_inventaire),
      periode_debut: toBackendDateTime(payload.periode_debut),
      periode_fin: toBackendDateTime(payload.periode_fin),
    });

    await load();
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Supprimer cet inventaire ?");
    if (!ok) return;

    await deleteInventaire(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <InventaireHeader
          loading={loading}
          onRefresh={load}
          total={data.length}
          criticalCount={criticalCount}
        />

        <InventaireStats data={data} />

        <InventaireFiltersBar
          data={data}
          filters={filters}
          onChange={setFilters}
        />

        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="px-4 py-2 rounded-sm bg-[#00A09D] text-white font-medium"
          >
            + Nouvel inventaire
          </button>
        </div>

        <InventaireCriticalPanel
          data={filtered}
          onSelect={(item) => {
            setSelected(item);
            setDetailOpen(true);
          }}
        />

        <InventaireAuditCards
          data={filtered}
          onAdjust={handleQuickAdjust}
          onView={(item) => {
            setSelected(item);
            setDetailOpen(true);
          }}
          onEdit={(item) => {
            setEditing(item);
            setFormOpen(true);
          }}
          onDelete={handleDelete}
        />

        <InventaireDetailDrawer
          item={selected}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelected(null);
          }}
        />

        <InventaireFormDrawer
          open={formOpen}
          item={editing}
          entrepots={entrepotsOptions}
          emballages={emballagesOptions}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={editing ? handleEdit : handleCreate}
        />
      </div>
    </div>
  );
}