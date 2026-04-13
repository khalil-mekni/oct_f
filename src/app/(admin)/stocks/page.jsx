"use client";

import { useEffect, useMemo, useState } from "react";
import { listStockHistory } from "@/lib/stock.api";
import Button from "@/components/ui/button/Button";
import {
  RefreshCcw,
  Search,
  Warehouse,
  Package,
  Boxes,
  ArrowDownUp,
  CalendarRange,
  Filter,
  TrendingUp,
  TrendingDown,
  History,
} from "lucide-react";

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

const inputClass =
  "w-full rounded-2xl border border-[#d7e7e5] bg-white px-4 py-3 text-sm font-medium text-[#042B29] outline-none transition-all placeholder:text-slate-400 focus:border-[#5EB7BF] focus:ring-4 focus:ring-[#5EB7BF]/10";

function StatCard({ title, value, icon, tone = "teal" }) {
  const tones = {
    teal: "bg-[#5EB7BF]/10 text-[#2f8f98]",
    orange: "bg-[#EE7A46]/10 text-[#EE7A46]",
    red: "bg-[#D74728]/10 text-[#D74728]",
    dark: "bg-[#042B29]/10 text-[#042B29]",
  };

  return (
    <div className="rounded-2xl border border-[#e3eeec] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5b8e8a]">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-[1000] tracking-tighter text-[#042B29]">
            {value}
          </h3>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function Label({ children, icon }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#5b8e8a]">
      {icon}
      {children}
    </label>
  );
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

  const [from, setFrom] = useState(toDateTimeLocalInputValue(firstDay));
  const [to, setTo] = useState(toDateTimeLocalInputValue(today, true));

  const [showFilters, setShowFilters] = useState(true);

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

  function resetFilters() {
    setEntrepotId("");
    setEmballageId("");
    setLotId("");
    setFrom(toDateTimeLocalInputValue(firstDay));
    setTo(toDateTimeLocalInputValue(today, true));
    setSearch("");
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

  const totalEntrees = useMemo(() => {
    return filtered
      .filter((item) => item?.sens === "E")
      .reduce((sum, item) => sum + Number(item?.quantite ?? 0), 0);
  }, [filtered]);

  const totalSorties = useMemo(() => {
    return filtered
      .filter((item) => item?.sens === "S")
      .reduce((sum, item) => sum + Number(item?.quantite ?? 0), 0);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#f7fbfa] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d3a37] to-[#5EB7BF] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
                Stock Management
              </p>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-white drop-shadow-sm">
                Historique du Stock
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-white/90">
                Suivi lisible des entrées et sorties avec une vue plus propre et plus professionnelle.
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              className="group inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#042B29] shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <RefreshCcw
                size={16}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
              Actualiser
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Mouvements"
            value={filtered.length}
            icon={<History size={20} />}
            tone="dark"
          />
          <StatCard
            title="Entrées"
            value={totalEntrees}
            icon={<TrendingUp size={20} />}
            tone="teal"
          />
          <StatCard
            title="Sorties"
            value={totalSorties}
            icon={<TrendingDown size={20} />}
            tone="red"
          />
          <StatCard
            title="Période"
            value={from || to ? "Active" : "Libre"}
            icon={<CalendarRange size={20} />}
            tone="orange"
          />
        </div>

        <div className="rounded-2xl border border-[#e3eeec] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#edf3f2] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5EB7BF]/10 text-[#2f8f98]">
                <Filter size={18} />
              </div>
              <div>
                <h2 className="text-lg font-[1000] tracking-tight text-[#042B29]">
                  Filtres avancés
                </h2>
                <p className="text-xs uppercase tracking-widest text-[#5b8e8a]">
                  Navigation et ciblage
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="rounded-xl border border-[#d7e7e5] bg-white px-4 py-2 text-sm font-semibold text-[#4a7d79] transition hover:bg-[#f7fbfa]"
              >
                {showFilters ? "Masquer" : "Afficher"}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-[#d7e7e5] bg-white px-4 py-2 text-sm font-semibold text-[#4a7d79] transition hover:bg-[#f7fbfa]"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div
            className={`grid overflow-hidden transition-all duration-300 ${
              showFilters ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0">
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-6">
                <div>
                  <Label icon={<Warehouse size={14} />}>Entrepôt ID</Label>
                  <input
                    value={entrepotId}
                    onChange={(e) => setEntrepotId(e.target.value)}
                    placeholder="Tous"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label icon={<Package size={14} />}>Emballage ID</Label>
                  <input
                    value={emballageId}
                    onChange={(e) => setEmballageId(e.target.value)}
                    placeholder="Tous"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label icon={<Boxes size={14} />}>Lot ID</Label>
                  <input
                    value={lotId}
                    onChange={(e) => setLotId(e.target.value)}
                    placeholder="Tous"
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label icon={<CalendarRange size={14} />}>Du</Label>
                  <input
                    type="datetime-local"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label icon={<CalendarRange size={14} />}>Au</Label>
                  <input
                    type="datetime-local"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="primary"
                    className="w-full rounded-2xl bg-gradient-to-r from-[#042B29] to-[#5EB7BF] py-3 text-white"
                    onClick={load}
                  >
                    Filtrer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5b8e8a]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dépôt, lot, emballage, entrée, sortie..."
              className="w-full rounded-2xl border border-[#d7e7e5] bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-[#5EB7BF] focus:ring-4 focus:ring-[#5EB7BF]/10"
            />
          </div>

          <div className="rounded-full bg-[#f2f7f6] px-4 py-2 text-xs font-bold text-[#4a7d79] border border-[#e3eeec]">
            {filtered.length} résultat(s)
          </div>
        </div>

        {error && (
          <div className="animate-[shake_0.35s_ease-in-out] rounded-xl border border-[#D74728]/20 bg-[#D74728]/10 px-4 py-3 text-sm font-semibold text-[#D74728]">
            ⚠️ {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#e3eeec] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#edf3f2] px-6 py-5">
            <div>
              <h3 className="flex items-center gap-2 text-lg md:text-xl font-[1000] tracking-tight text-[#042B29]">
                <ArrowDownUp className="text-[#4a9fa7]" size={20} />
                Journal des flux stock
              </h3>
              <p className="mt-1 text-xs uppercase tracking-widest text-[#5b8e8a]">
                Lecture détaillée des mouvements
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-[#f4fbfa] to-white">
                <tr className="border-b border-[#e8f0ef]">
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Dépôt
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Code lot
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Code emballage
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Sens
                  </th>
                  <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#5b8e8a]">
                    Quantité
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5EB7BF] border-t-transparent"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#5b8e8a]">
                          Chargement...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm font-bold uppercase tracking-widest text-slate-400"
                    >
                      Aucun mouvement trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, index) => {
                    const sortie = item?.sens === "S";

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-[#edf3f2] transition duration-200 hover:bg-[#f8fbfa] animate-[fadeIn_0.4s_ease_forwards]"
                        style={{ animationDelay: `${index * 35}ms` }}
                      >
                        <td className="px-4 py-4">
                          <div className="inline-flex flex-col rounded-xl border border-[#edf3f2] bg-[#fbfdfd] px-3 py-2">
                            <span className="text-[11px] font-bold text-[#042B29]">
                              {formatDate(item?.date_stock).split(",")[0] || "-"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(item?.date_stock).split(",")[1]?.trim() || ""}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#042B29]">
                            {item?.entrepot?.nom ?? "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-xl border border-[#dfe9e7] bg-[#f6faf9] px-3 py-1.5 font-mono text-xs font-bold text-[#2f6f6b]">
                            {item?.lot?.code_lot ?? "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-xl border border-[#ece7df] bg-[#fffaf6] px-3 py-1.5 text-xs font-bold text-[#b96335]">
                            {item?.emballage?.code ?? "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={
                              sortie
                                ? "inline-flex rounded-full bg-[#D74728]/10 px-3 py-1 text-xs font-bold text-[#D74728]"
                                : "inline-flex rounded-full bg-[#042B29]/10 px-3 py-1 text-xs font-bold text-[#042B29]"
                            }
                          >
                            {sortie ? "Sortie" : "Entrée"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <span
                            className={`text-base font-[1000] tracking-tight ${
                              sortie ? "text-[#D74728]" : "text-[#2f8f98]"
                            }`}
                          >
                            {formatSignedQuantity(item)}
                          </span>
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
    </div>
  );
}