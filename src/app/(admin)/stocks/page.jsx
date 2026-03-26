"use client";

import { useEffect, useMemo, useState } from "react";
import { listStockHistory } from "@/lib/stock.api";
import Button from "@/components/ui/button/Button";

function toDateTimeLocalInputValue(date, endOfDay = false) {
  const d = new Date(date);

  if (endOfDay) {
    d.setHours(23, 59, 59, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toGraphqlDateTime(value, isEnd = false) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (raw.includes("T")) {
    const [datePart, timePart = "00:00"] = raw.split("T");
    const normalizedTime = timePart.length === 5 ? `${timePart}:00` : timePart;
    return `${datePart} ${normalizedTime}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw} ${isEnd ? "23:59:59" : "00:00:00"}`;
  }

  return raw;
}

function formatDate(value) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("fr-FR");
}

function formatSignedQuantity(item) {
  const qty = Number(item?.quantite ?? 0);
  return item?.sens === "S" ? `-${qty}` : `+${qty}`;
}

export default function StockPage() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [entrepotId, setEntrepotId] = useState("");
  const [emballageId, setEmballageId] = useState("");
  const [lotId, setLotId] = useState("");

  const [from, setFrom] = useState(toDateTimeLocalInputValue(firstDay, false));
  const [to, setTo] = useState(toDateTimeLocalInputValue(today, true));

  async function load() {
    try {
      setLoading(true);
      setError("");

      const history = await listStockHistory({
        entrepotId: entrepotId || null,
        emballageId: emballageId || null,
        lotId: lotId || null,
        from: toGraphqlDateTime(from, false),
        to: toGraphqlDateTime(to, true),
      });

      setItems(Array.isArray(history) ? history : []);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement de l'historique du stock."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const haystack = [
        item?.entrepot?.nom,
        item?.emballage?.code,
        item?.emballage?.name,
        item?.lot?.code_lot,
        item?.sens,
        item?.sens === "E" ? "entrée" : "sortie",
        String(item?.quantite ?? ""),
        formatDate(item?.date_stock),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [items, search]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="tracking-tight text-2xl font-black text-gray-900 dark:text-white">
            Historique du Stock
          </h1>
          <p className="text-sm text-gray-500">
            Archive des entrées et sorties du stock.
          </p>
        </div>

        <Button variant="primary" onClick={load}>
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:grid-cols-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            Entrepôt ID
          </label>
          <input
            value={entrepotId}
            onChange={(e) => setEntrepotId(e.target.value)}
            placeholder="Tous"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            Emballage ID
          </label>
          <input
            value={emballageId}
            onChange={(e) => setEmballageId(e.target.value)}
            placeholder="Tous"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            Lot ID
          </label>
          <input
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            placeholder="Tous"
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            Du
          </label>
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">
            Au
          </label>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />
        </div>

        <div className="flex items-end">
          <Button variant="primary" className="w-full" onClick={load}>
            Filtrer
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dépôt, lot, emballage, entrée, sortie..."
          className="w-full rounded-xl border py-3 pl-4 pr-10 sm:w-96"
        />

        <div className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold">
          Total: {filtered.length}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border bg-red-50 p-4 text-red-600">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-xs font-bold uppercase">Date</th>
                <th className="px-4 py-4 text-xs font-bold uppercase">Dépôt</th>
                <th className="px-4 py-4 text-xs font-bold uppercase">Code lot</th>
                <th className="px-4 py-4 text-xs font-bold uppercase">Code emballage</th>
                <th className="px-4 py-4 text-xs font-bold uppercase">Sens</th>
                <th className="px-4 py-4 text-xs font-bold uppercase">Quantité</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    Aucun mouvement trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const sortie = item?.sens === "S";

                  return (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-4">
                        {formatDate(item?.date_stock)}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {item?.entrepot?.nom ?? "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item?.lot?.code_lot ?? "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item?.emballage?.code ?? "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            sortie
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {sortie ? "S" : "E"}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-4 font-bold ${
                          sortie ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatSignedQuantity(item)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}