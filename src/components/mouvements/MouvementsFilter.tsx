import React from "react";

interface Props {
  search: string;
  setSearch: (s: string) => void;
  total: number;
}

export default function MouvementsFilter({ search, setSearch, total }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un code, lot, entrepôt..."
            className="w-full rounded-[22px] border-2 border-transparent bg-white px-6 py-4 shadow-sm outline-none transition-all focus:border-[#00A09D]/20 focus:ring-4 focus:ring-[#00A09D]/5 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="rounded-[22px] border border-gray-100 bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Total
          </span>
          <span className="mt-1 block text-lg font-[1000] tracking-tighter text-[#1C2434] dark:text-white">
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}