"use client";

import React, { useMemo, useState } from "react";
import { useMercureAlerts } from "@/hooks/useMercureAlerts";
import {
  archiveAlert,
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  type Alert,
  type AlertSeverity,
} from "@/lib/notifications.api";
import {
  archiveAlertInCache,
  markAlertAsReadInCache,
  markAllAlertsAsReadInCache,
} from "@/lib/alerts-cache";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getSeverityConfig(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return {
        label: "Critique",
        badgeBg: "#fef2f2",
        badgeText: "#b91c1c",
        iconBg: "#fef2f2",
        iconStroke: "#dc2626",
        borderClass: "border-l-[2.5px] border-l-red-500",
      };
    case "warning":
      return {
        label: "Warning",
        badgeBg: "#fffbeb",
        badgeText: "#92400e",
        iconBg: "#fffbeb",
        iconStroke: "#d97706",
        borderClass: "border-l-[2.5px] border-l-amber-500",
      };
    default:
      return {
        label: "Info",
        badgeBg: "#eff6ff",
        badgeText: "#1d4ed8",
        iconBg: "#eff6ff",
        iconStroke: "#3b82f6",
        borderClass: "border-l-[2.5px] border-l-blue-500",
      };
  }
}

function getAlertTypeLabel(type: string) {
  const labels: Record<string, string> = {
    LOW_STOCK: "Stock faible",
    WAREHOUSE_CAPACITY_HIGH: "Entrepôt saturé",
    INVENTORY_ANOMALY: "Anomalie inventaire",
    SUPPLIER_DELAY: "Retard fournisseur",
    DELIVERY_IMMINENT: "Livraison imminente",
    CONTRAT_EXPIRING: "Contrat proche expiration",
    CONTRACT_EXPIRED: "Contrat expiré",
    CONTRACT_CONSUMPTION_HIGH: "Consommation élevée",
    CONTRACT_QUANTITY_EXCEEDED: "Quantité dépassée",
    ORDER_NOT_RECEIVED_ON_TIME: "Commande en retard",
  };

  return labels[type] ?? type;
}

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return "Récent";

  const diff = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;

  const days = Math.floor(diff / 86400);

  if (days < 7) return `Il y a ${days} j`;

  return new Date(dateString).toLocaleDateString("fr-FR");
}

function AlertIcon({
  severity,
  config,
}: {
  severity: AlertSeverity;
  config: ReturnType<typeof getSeverityConfig>;
}) {
  if (severity === "info") {
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="7.5"
          stroke={config.iconStroke}
          strokeWidth="1.5"
        />
        <path
          d="M10 9v4"
          stroke={config.iconStroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="7" r="0.75" fill={config.iconStroke} />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2.5L2.5 16.25H17.5L10 2.5Z"
        stroke={config.iconStroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 7v3.75"
        stroke={config.iconStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13.5" r="0.8" fill={config.iconStroke} />
    </svg>
  );
}

type SidebarFilter = {
  statusFilter: string;
  severityFilter: string;
  typeFilter: string;
};

const STATUS_ITEMS = [
  { key: "all", label: "Toutes", dot: "#00A09D" },
  { key: "unread", label: "Non lues", dot: "#6366f1" },
  { key: "read", label: "Lues", dot: "#94a3b8" },
  { key: "archived", label: "Archivées", dot: "#e2e8f0" },
];

const SEVERITY_ITEMS = [
  { key: "critical", label: "Critiques", dot: "#dc2626" },
  { key: "warning", label: "Warning", dot: "#d97706" },
  { key: "info", label: "Info", dot: "#3b82f6" },
];

const TYPE_ITEMS = [
  { key: "LOW_STOCK", label: "Stock faible" },
  { key: "WAREHOUSE_CAPACITY_HIGH", label: "Entrepôt saturé" },
  { key: "SUPPLIER_DELAY", label: "Retard fournisseur" },
  { key: "CONTRAT_EXPIRING", label: "Contrats" },
  { key: "ORDER_NOT_RECEIVED_ON_TIME", label: "Commandes" },
];

function Sidebar({
  filters,
  setFilters,
  alerts,
}: {
  filters: SidebarFilter;
  setFilters: React.Dispatch<React.SetStateAction<SidebarFilter>>;
  alerts: Alert[];
}) {
  const countByStatus = (key: string) => {
    if (key === "all") {
      return alerts.filter((a) => a.user_status !== "archived").length;
    }

    return alerts.filter((a) => a.user_status === key).length;
  };

  const countBySeverity = (key: string) =>
    alerts.filter(
      (a) => a.severity === key && a.user_status !== "archived"
    ).length;

  function SbItem({
    label,
    dot,
    active,
    count,
    countVariant,
    onClick,
  }: {
    label: string;
    dot?: string;
    active: boolean;
    count?: number;
    countVariant?: "teal" | "red" | "default";
    onClick: () => void;
  }) {
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
          active
            ? "bg-[#00A09D]/[0.08] font-medium text-[#00807d]"
            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"
        }`}
      >
        <span className="flex items-center gap-2.5">
          {dot && (
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: dot }}
            />
          )}
          {label}
        </span>

        {count !== undefined && count > 0 && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              countVariant === "teal"
                ? "bg-[#00A09D]/10 text-[#00807d]"
                : countVariant === "red"
                ? "bg-red-50 text-red-700"
                : "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="flex h-full flex-col gap-1 border-r border-gray-100 bg-white px-3 py-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 px-2 pb-3 dark:border-gray-800">
        <span className="text-[14px] font-medium text-gray-900 dark:text-white">
          Notifications
        </span>
      </div>

      <p className="px-2.5 pt-1 pb-1 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
        Statut
      </p>

      {STATUS_ITEMS.map((item) => (
        <SbItem
          key={item.key}
          label={item.label}
          dot={item.dot}
          active={
            filters.statusFilter === item.key &&
            filters.severityFilter === "all" &&
            filters.typeFilter === "all"
          }
          count={countByStatus(item.key)}
          countVariant={item.key === "unread" ? "teal" : "default"}
          onClick={() =>
            setFilters({
              statusFilter: item.key,
              severityFilter: "all",
              typeFilter: "all",
            })
          }
        />
      ))}

      <p className="mt-2 px-2.5 pt-1 pb-1 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
        Sévérité
      </p>

      {SEVERITY_ITEMS.map((item) => (
        <SbItem
          key={item.key}
          label={item.label}
          dot={item.dot}
          active={filters.severityFilter === item.key}
          count={countBySeverity(item.key)}
          countVariant={item.key === "critical" ? "red" : "default"}
          onClick={() =>
            setFilters({
              statusFilter: "all",
              severityFilter: item.key,
              typeFilter: "all",
            })
          }
        />
      ))}

      <p className="mt-2 px-2.5 pt-1 pb-1 text-[10.5px] font-medium uppercase tracking-widest text-gray-400">
        Type
      </p>

      {TYPE_ITEMS.map((item) => (
        <SbItem
          key={item.key}
          label={item.label}
          active={filters.typeFilter === item.key}
          onClick={() =>
            setFilters({
              statusFilter: "all",
              severityFilter: "all",
              typeFilter: item.key,
            })
          }
        />
      ))}
    </aside>
  );
}

export default function NotificationsPageClient() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useMercureAlerts();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<SidebarFilter>({
    statusFilter: "all",
    severityFilter: "all",
    typeFilter: "all",
  });

  const {
    data: alerts = [],
    isLoading,
    isFetching,
  } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markAlertAsRead(id),
    onSuccess: (_data, id) => markAlertAsReadInCache(queryClient, id),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAlertsAsRead(),
    onSuccess: () => markAllAlertsAsReadInCache(queryClient),
  });

  const archiveAlertMutation = useMutation({
    mutationFn: (id: string) => archiveAlert(id),
    onSuccess: (_data, id) => archiveAlertInCache(queryClient, id),
  });

  async function handleOpenAlert(alert: Alert) {
    try {
      if (alert.user_status === "unread") {
        await markAlertAsRead(alert.id);
        markAlertAsReadInCache(queryClient, alert.id);
      }

      if (alert.action_url) {
        router.push(alert.action_url);
      }
    } catch {
      if (alert.action_url) {
        router.push(alert.action_url);
      }
    }
  }

  const stats = useMemo(
    () => ({
      unread: alerts.filter((a) => a.user_status === "unread").length,
      critical: alerts.filter(
        (a) => a.severity === "critical" && a.user_status !== "archived"
      ).length,
      active: alerts.filter((a) => a.user_status !== "archived").length,
      archived: alerts.filter((a) => a.user_status === "archived").length,
    }),
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    const unique = Array.from(
      new Map(alerts.map((a) => [String(a.id), a])).values()
    );

    return unique
      .filter((a) => {
        if (
          filters.statusFilter !== "all" &&
          a.user_status !== filters.statusFilter
        ) {
          return false;
        }

        if (
          filters.severityFilter !== "all" &&
          a.severity !== filters.severityFilter
        ) {
          return false;
        }

        if (filters.typeFilter !== "all" && a.type !== filters.typeFilter) {
          return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();

          return (
            a.title?.toLowerCase().includes(q) ||
            a.message?.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort(
        (a, b) =>
          (b.created_at ? new Date(b.created_at).getTime() : 0) -
          (a.created_at ? new Date(a.created_at).getTime() : 0)
      );
  }, [alerts, filters, search]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="w-[240px] flex-shrink-0 overflow-y-auto">
        <Sidebar filters={filters} setFilters={setFilters} alerts={alerts} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-8 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-800">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-48 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300"
              />
            </div>

            {isFetching && (
              <span className="text-[12px] text-gray-400">
                Actualisation…
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="./"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Retour
            </Link>

            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || stats.unread === 0}
              className="flex items-center gap-1.5 rounded-lg bg-[#00A09D] px-3 py-1.5 text-[13px] font-medium text-white transition hover:bg-[#008f8c] disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending
                ? "Traitement…"
                : "Tout marquer lu"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
          {[
            { label: "Non lues", value: stats.unread, color: "#6366f1" },
            { label: "Critiques", value: stats.critical, color: "#dc2626" },
            { label: "Actives", value: stats.active, color: "#00A09D" },
            { label: "Archivées", value: stats.archived, color: "#94a3b8" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-gray-800"
            >
              <span
                className="h-6 w-0.5 flex-shrink-0 rounded-full"
                style={{ background: s.color }}
              />

              <div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {s.label}
                </p>
                <p
                  className="text-[18px] font-medium leading-tight"
                  style={{ color: s.color }}
                >
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-white dark:bg-gray-900"
                />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <p className="text-[14px] font-medium text-gray-600 dark:text-gray-400">
                Aucune alerte trouvée
              </p>
              <p className="text-[13px] text-gray-400">
                Essayez de modifier vos filtres
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredAlerts.map((alert) => {
                const cfg = getSeverityConfig(alert.severity);
                const isUnread = alert.user_status === "unread";

                return (
                  <div
                    key={alert.id}
                    className={`flex gap-3 rounded-xl border bg-white px-4 py-3.5 transition-colors dark:bg-gray-900 ${
                      cfg.borderClass
                    } ${
                      isUnread
                        ? "border-gray-200 dark:border-gray-700"
                        : "border-gray-100 opacity-75 dark:border-gray-800"
                    }`}
                  >
                    <div
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: cfg.iconBg }}
                    >
                      <AlertIcon severity={alert.severity} config={cfg} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p
                          className={`text-[13.5px] leading-snug ${
                            isUnread
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "font-medium text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {alert.title}
                        </p>

                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: cfg.badgeBg,
                            color: cfg.badgeText,
                          }}
                        >
                          {cfg.label}
                        </span>

                        {isUnread && (
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            Non lue
                          </span>
                        )}
                      </div>

                      <p className="mb-2.5 text-[12.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
                          {getAlertTypeLabel(alert.type)}
                        </span>

                        <span className="text-[11px] text-gray-400">
                          {formatRelativeTime(alert.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 flex-col gap-1.5 sm:flex-row sm:items-start">
                      {alert.action_url && (
                        <button
                          onClick={() => handleOpenAlert(alert)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          Ouvrir
                        </button>
                      )}

                      {alert.user_status === "unread" && (
                        <button
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                          className="rounded-lg bg-[#00A09D]/10 px-3 py-1.5 text-[12px] font-medium text-[#00807d] transition hover:bg-[#00A09D]/20"
                        >
                          Lu
                        </button>
                      )}

                      {alert.user_status !== "archived" && (
                        <button
                          onClick={() => archiveAlertMutation.mutate(alert.id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                        >
                          Archiver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}