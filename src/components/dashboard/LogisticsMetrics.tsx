"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";
import { AlertTriangle, Warehouse, PackageCheck, Activity } from "lucide-react";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

function MetricCard({
  title,
  value,
  icon,
  badge,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        {badge}
      </div>
    </div>
  );
}

export default function LogisticsMetrics() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[138px] animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400">
        Impossible de charger les métriques du dashboard.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      <MetricCard
        title="Entrepôts"
        value={data.totalWarehouses}
        icon={<Warehouse className="size-6 text-gray-800 dark:text-white/90" />}
        badge={
          <Badge color="light">
            <GroupIcon />
            Global
          </Badge>
        }
      />

      <MetricCard
        title="Stock total"
        value={data.totalStock.toLocaleString()}
        icon={<PackageCheck className="size-6 text-gray-800 dark:text-white/90" />}
        badge={
          <Badge color="success">
            <ArrowUpIcon />
            Disponible
          </Badge>
        }
      />

      <MetricCard
        title="Occupation globale"
        value={`${data.capacityUsageRate.toFixed(1)}%`}
        icon={<Activity className="size-6 text-gray-800 dark:text-white/90" />}
        badge={
          <Badge
            color={
              data.capacityUsageRate >= 90
                ? "error"
                : data.capacityUsageRate >= 80
                ? "warning"
                : "success"
            }
          >
            {data.capacityUsageRate >= 80 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data.totalAvailableCapacity.toLocaleString()} libres
          </Badge>
        }
      />

      <MetricCard
        title="Alertes critiques"
        value={data.criticalAlertsCount}
        icon={<AlertTriangle className="size-6 text-gray-800 dark:text-white/90" />}
        badge={
          <Badge color={data.criticalAlertsCount > 0 ? "error" : "success"}>
            {data.criticalAlertsCount > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {data.unreadAlertsCount} non lues
          </Badge>
        }
      />
    </div>
  );
}