"use client";

import { useMemo } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, MoveRight, Package } from "lucide-react";
import { StockHistoryItem } from "@/types/stock";
import { formatDateTime } from "./stock.util";

type SortKey = "date_stock" | "quantite";
type SortDir = "asc" | "desc";

type Props = {
  items: StockHistoryItem[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
};

// ─── Grouping ─────────────────────────────────────────────────────────────────

function groupMovements(items: StockHistoryItem[]): Array<{
  key: string;
  rows: StockHistoryItem[];
  isPaired: boolean;
}> {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(b.date_stock).getTime() - new Date(a.date_stock).getTime() ||
      Number(b.id) - Number(a.id)
  );

  const used = new Set<string>();
  const groups: Array<{ key: string; rows: StockHistoryItem[]; isPaired: boolean }> = [];

  for (const row of sorted) {
    if (used.has(row.id)) continue;

    const partner = sorted.find(
      (other) =>
        !used.has(other.id) &&
        other.id !== row.id &&
        other.date_stock === row.date_stock &&
        other.lot?.id === row.lot?.id &&
        other.emballage?.id === row.emballage?.id &&
        Number(other.quantite) === Number(row.quantite) &&
        other.sens !== row.sens
    );

    if (partner) {
      used.add(row.id);
      used.add(partner.id);
      const [sortie, entree] =
        row.sens === "S" ? [row, partner] : [partner, row];
      groups.push({
        key: `pair-${sortie.id}-${entree.id}`,
        rows: [sortie, entree],
        isPaired: true,
      });
    } else {
      used.add(row.id);
      groups.push({ key: `solo-${row.id}`, rows: [row], isPaired: false });
    }
  }

  return groups;
}

// ─── Badges & Th helpers ──────────────────────────────────────────────────────

function SensBadge({ sens }: { sens: "E" | "S" }) {
  if (sens === "E") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#00A09D]/20 bg-[#00A09D]/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00A09D]" />
        Entrée
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-500">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Sortie
    </span>
  );
}

function ThSort({
  children,
  sortKey: key,
  active,
  dir,
  onSort,
  align = "left",
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={() => onSort(key)}
      className={`cursor-pointer select-none border-b border-gray-50 px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-colors dark:border-gray-800 ${
        align === "right" ? "text-right" : "text-left"
      } ${
        active
          ? "text-[#00A09D]"
          : "text-gray-400 hover:text-[#1C2434] dark:hover:text-white"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {active ? (
          dir === "asc" ? (
            <ArrowUp size={11} className="text-[#00A09D]" />
          ) : (
            <ArrowDown size={11} className="text-[#00A09D]" />
          )
        ) : (
          <ArrowUpDown size={10} className="opacity-30" />
        )}
      </span>
    </th>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={`border-b border-gray-50 px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:border-gray-800 ${
        align === "right"
          ? "text-right"
          : align === "center"
            ? "text-center"
            : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StockTable({
  items,
  loading,
  sortKey,
  sortDir,
  onSort,
}: Props) {
  const groups = useMemo(() => groupMovements(items), [items]);

  const stats = useMemo(() => {
    const entrees = items.filter((i) => i.sens === "E");
    const sorties = items.filter((i) => i.sens === "S");
    return {
      entrees: entrees.length,
      sorties: sorties.length,
      totalE: entrees.reduce((s, i) => s + Number(i.quantite), 0),
      totalS: sorties.reduce((s, i) => s + Number(i.quantite), 0),
    };
  }, [items]);

  return (
    <>
      {/* Mini stats row — shown only when there are items */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-50 px-6 py-3 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <Package size={13} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Page courante :
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1C2434] dark:text-white">
              {items.length} ligne{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#00A09D]/15 bg-[#00A09D]/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00A09D]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
              {stats.entrees} entrée{stats.entrees !== 1 ? "s" : ""}
            </span>
            <span className="font-mono text-[10px] font-black text-[#00A09D]">
              +{stats.totalE.toLocaleString("fr-FR")}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              {stats.sorties} sortie{stats.sorties !== 1 ? "s" : ""}
            </span>
            <span className="font-mono text-[10px] font-black text-red-500">
              -{stats.totalS.toLocaleString("fr-FR")}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-gray-50/50 dark:bg-gray-800/30">
            <tr>
              <ThSort
                sortKey="date_stock"
                active={sortKey === "date_stock"}
                dir={sortDir}
                onSort={onSort}
              >
                Date
              </ThSort>
              <Th>Dépôt</Th>
              <Th>Code Lot</Th>
              <Th>Emballage</Th>
              <Th align="center">Sens</Th>
              <ThSort
                sortKey="quantite"
                active={sortKey === "quantite"}
                dir={sortDir}
                onSort={onSort}
                align="right"
              >
                Quantité
              </ThSort>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#00A09D] border-t-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Chargement...
                    </span>
                  </div>
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <MoveRight size={28} className="text-gray-200" />
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                      Aucun mouvement trouvé
                    </p>
                    <p className="text-xs text-gray-300">Modifiez les filtres</p>
                  </div>
                </td>
              </tr>
            ) : (
              groups.map(({ key, rows, isPaired }) => (
                <GroupRows key={key} rows={rows} isPaired={isPaired} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── GroupRows ────────────────────────────────────────────────────────────────

function GroupRows({
  rows,
  isPaired,
}: {
  rows: StockHistoryItem[];
  isPaired: boolean;
}) {
  return (
    <>
      {rows.map((item, idx) => {
        const { date, time } = formatDateTime(item.date_stock);
        const isFirst = idx === 0;
        const isLast = idx === rows.length - 1;
        const isEntree = item.sens === "E";

        const borderClass =
          isPaired && !isLast
            ? "border-b-0"
            : "border-b border-gray-50 dark:border-gray-800/60";

        return (
          <tr
            key={item.id}
            className={`group transition-colors duration-100 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 ${
              isPaired && !isFirst ? "bg-gray-50/20 dark:bg-gray-800/10" : ""
            }`}
          >
            {/* Date */}
            <td className={`px-5 py-3.5 ${borderClass}`}>
              {isFirst || !isPaired ? (
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#1C2434] dark:text-white">
                    {date}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">{time}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-3">
                  <span className="text-[10px] text-gray-300">↳</span>
                  <span className="text-[10px] font-bold text-gray-300">{time}</span>
                </div>
              )}
            </td>

            {/* Dépôt */}
            <td className={`px-5 py-3.5 ${borderClass}`}>
              <span
                className={`text-sm font-black leading-snug ${
                  isPaired && !isFirst
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-[#1C2434] dark:text-white"
                }`}
              >
                {item.entrepot?.nom ?? "—"}
              </span>
            </td>

            {/* Lot */}
            <td className={`px-5 py-3.5 ${borderClass}`}>
              {item.lot?.code_lot ? (
                <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 font-mono text-[10px] font-black text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {item.lot.code_lot}
                </span>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </td>

            {/* Emballage */}
            <td className={`px-5 py-3.5 ${borderClass}`}>
              {item.emballage?.code ? (
                <span className="inline-flex items-center rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1 font-mono text-[10px] font-black text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400">
                  {item.emballage.code}
                </span>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </td>

            {/* Sens */}
            <td className={`px-5 py-3.5 text-center ${borderClass}`}>
              <SensBadge sens={item.sens} />
            </td>

            {/* Quantité */}
            <td className={`px-5 py-3.5 text-right ${borderClass}`}>
              <span
                className={`font-mono text-base font-[1000] tabular-nums tracking-tight ${
                  isEntree ? "text-[#00A09D]" : "text-red-500"
                }`}
              >
                {isEntree ? "+" : "−"}
                {Number(item.quantite).toLocaleString("fr-FR")}
              </span>
            </td>
          </tr>
        );
      })}

      {isPaired && (
        <tr aria-hidden className="pointer-events-none">
          <td colSpan={6} className="px-5 py-0">
            <div
              className="border-l-2 border-dashed border-gray-100 dark:border-gray-800"
              style={{ height: "2px", marginLeft: "20px" }}
            />
          </td>
        </tr>
      )}
    </>
  );
}