"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (n: number) => void;
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function StockPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const pages = buildPages(page, totalPages);

  if (totalPages <= 1 && total <= perPage) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/30 px-6 py-4 sm:flex-row dark:border-gray-800 dark:bg-gray-800/20">
      {/* Left: info + per-page */}
      <div className="flex items-center gap-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className="text-[#1C2434] dark:text-white">{from}–{to}</span>
          {" "}sur{" "}
          <span className="text-[#1C2434] dark:text-white">{total}</span>
          {" "}résultat{total !== 1 ? "s" : ""}
        </p>

        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Lignes
          </span>
          <select
            value={perPage}
            onChange={(e) => {
              onPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-xl border-2 border-gray-100 bg-white px-2.5 py-1 text-xs font-black text-[#1C2434] outline-none transition-all focus:border-[#00A09D]/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <NavBtn onClick={() => onPageChange(1)} disabled={page === 1} title="Première page">
          <ChevronsLeft size={13} />
        </NavBtn>
        <NavBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} title="Page précédente">
          <ChevronLeft size={13} />
        </NavBtn>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`e-${i}`}
                className="flex h-8 w-6 items-center justify-center text-xs font-bold text-gray-300"
              >
                ···
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`flex h-8 min-w-[32px] items-center justify-center rounded-xl px-2 text-[11px] font-black transition-all ${
                  p === page
                    ? "bg-[#00A09D] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <NavBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Page suivante"
        >
          <ChevronRight size={13} />
        </NavBtn>
        <NavBtn
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title="Dernière page"
        >
          <ChevronsRight size={13} />
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all hover:border-[#00A09D]/20 hover:bg-[#00A09D]/5 hover:text-[#00A09D] disabled:pointer-events-none disabled:opacity-25 dark:border-gray-700 dark:bg-gray-800"
    >
      {children}
    </button>
  );
}

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}