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
        badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        border: "border-l-red-500",
        dot: "bg-red-500",
        label: "Critique",
      };
    case "warning":
      return {
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
        border: "border-l-amber-500",
        dot: "bg-amber-500",
        label: "Warning",
      };
    default:
      return {
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
        border: "border-l-blue-500",
        dot: "bg-blue-500",
        label: "Info",
      };
  }
}

function getAlertTypeLabel(type: string) {
  switch (type) {
    case "LOW_STOCK":
      return "Stock faible";
    case "WAREHOUSE_CAPACITY_HIGH":
      return "Entrepôt saturé";
    case "INVENTORY_ANOMALY":
      return "Anomalie inventaire";
    case "SUPPLIER_DELAY":
      return "Retard fournisseur";
    case "DELIVERY_IMMINENT":
      return "Livraison imminente";
    case "CONTRAT_EXPIRING":
      return "Contrat proche expiration";
    case "CONTRACT_EXPIRED":
      return "Contrat expiré";
    case "CONTRACT_CONSUMPTION_HIGH":
      return "Consommation contrat élevée";
    case "CONTRACT_QUANTITY_EXCEEDED":
      return "Quantité contrat dépassée";
    case "ORDER_NOT_RECEIVED_ON_TIME":
      return "Commande non réceptionnée à temps";
    default:
      return type;
  }
}

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return "Récent";

  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "À l’instant";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours} h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays} j`;

  return new Date(dateString).toLocaleDateString("fr-FR");
}

export default function NotificationsPageClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  useMercureAlerts();

  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: alerts = [], isLoading, isFetching } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => getAlerts(),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markAlertAsRead(id),
    onSuccess: (_data, id) => {
      markAlertAsReadInCache(queryClient, id);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAlertsAsRead(),
    onSuccess: () => {
      markAllAlertsAsReadInCache(queryClient);
    },
  });

  const archiveAlertMutation = useMutation({
    mutationFn: (id: string) => archiveAlert(id),
    onSuccess: (_data, id) => {
      archiveAlertInCache(queryClient, id);
    },
  });

  async function handleOpenAlert(alert: Alert) {
    try {
      if (alert.status === "unread") {
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

  const filteredAlerts = useMemo(() => {
    const uniqueAlerts = Array.from(
      new Map(alerts.map((alert) => [String(alert.id), alert])).values()
    );

    return uniqueAlerts
      .filter((alert) => {
        const matchType = typeFilter === "all" || alert.type === typeFilter;
        const matchSeverity =
          severityFilter === "all" || alert.severity === severityFilter;
        const matchStatus =
          statusFilter === "all" || alert.status === statusFilter;

        return matchType && matchSeverity && matchStatus;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [alerts, typeFilter, severityFilter, statusFilter]);

  const stats = useMemo(() => {
    const unread = alerts.filter((a) => a.status === "unread").length;
    const critical = alerts.filter(
      (a) => a.severity === "critical" && a.status !== "archived"
    ).length;
    const active = alerts.filter((a) => a.status !== "archived").length;
    const archived = alerts.filter((a) => a.status === "archived").length;

    return { unread, critical, active, archived };
  }, [alerts]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez toutes les alertes métier de votre plateforme.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending || stats.unread === 0}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {markAllAsReadMutation.isPending
              ? "Traitement..."
              : "Marquer tout comme lu"}
          </button>

          <Link
            href="./"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            Retour dashboard
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Non lues</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.unread}
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critiques</p>
          <h3 className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.critical}
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Actives</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.active}
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">Archivées</p>
          <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {stats.archived}
          </h3>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Filtres
          </h2>
          {isFetching && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Actualisation...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">Tous</option>
            <option value="LOW_STOCK">Stock faible</option>
            <option value="WAREHOUSE_CAPACITY_HIGH">Entrepôt saturé</option>
            <option value="INVENTORY_ANOMALY">Anomalie inventaire</option>
            <option value="SUPPLIER_DELAY">Retard fournisseur</option>
            <option value="DELIVERY_IMMINENT">Livraison imminente</option>
            <option value="CONTRAT_EXPIRING">Contrat proche expiration</option>
            <option value="CONTRACT_EXPIRED">Contrat expiré</option>
            <option value="CONTRACT_CONSUMPTION_HIGH">
              Consommation contrat élevée
            </option>
            <option value="CONTRACT_QUANTITY_EXCEEDED">
              Quantité contrat dépassée
            </option>
            <option value="ORDER_NOT_RECEIVED_ON_TIME">
              Commande non réceptionnée à temps
            </option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">Toutes</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critique</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="all">Tous</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
            <option value="archived">Archivées</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Chargement des alertes...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucune alerte trouvée.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredAlerts.map((alert) => {
              const severity = getSeverityConfig(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`border-l-4 ${severity.border} px-5 py-4`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {alert.title}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${severity.badge}`}
                        >
                          {severity.label}
                        </span>
                      </div>

                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/10 dark:text-gray-300">
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/10 dark:text-gray-300">
                          {formatRelativeTime(alert.created_at)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 dark:bg-white/10 dark:text-gray-300">
                          {alert.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {alert.action_url && (
                        <button
                          onClick={() => handleOpenAlert(alert)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          Ouvrir
                        </button>
                      )}

                      {alert.status === "unread" && (
                        <button
                          onClick={() => markAsReadMutation.mutate(alert.id)}
                          className="rounded-lg bg-brand-500 px-3 py-2 text-sm text-white"
                        >
                          Marquer comme lu
                        </button>
                      )}

                      {alert.status !== "archived" && (
                        <button
                          onClick={() => archiveAlertMutation.mutate(alert.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
                        >
                          Archiver
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}