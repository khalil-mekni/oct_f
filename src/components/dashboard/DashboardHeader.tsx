"use client";

import Link from "next/link";
import { BellRing, Building2, ArrowRightLeft, LayoutDashboard } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
              <LayoutDashboard className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Smart Packaging Logistics
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cockpit logistique — supervision des entrepôts, stocks, mouvements et alertes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/notifications"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <BellRing className="size-4" />
            Alertes
          </Link>

          <Link
            href="/entrepots"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <Building2 className="size-4" />
            Entrepôts
          </Link>

          <Link
            href="/mouvements"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <ArrowRightLeft className="size-4" />
            Mouvements
          </Link>
        </div>
      </div>
    </div>
  );
}