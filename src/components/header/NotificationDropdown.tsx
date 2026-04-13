"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAlerts } from "@/hooks/useAlerts";
import { useUnreadAlertsCount } from "@/hooks/useUnreadAlertsCount";
import { useMarkAlertAsRead } from "@/hooks/useMarkAlertAsRead";
import type { Alert, AlertSeverity } from "@/lib/notifications.api";
import { markAlertAsReadInCache, upsertAlertInCache } from "@/lib/alerts-cache";

type MercurePayload = {
  event?: string;
  alert?: Alert;
};

function getSeverityConfig(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return {
        dot: "bg-red-500",
        badge:
          "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        iconBg:
          "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
        label: "Critique",
      };
    case "warning":
      return {
        dot: "bg-amber-500",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
        iconBg:
          "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
        label: "Warning",
      };
    default:
      return {
        dot: "bg-blue-500",
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
        iconBg:
          "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
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

function alertDateValue(alert: Alert) {
  return alert.updated_at
    ? new Date(alert.updated_at).getTime()
    : alert.created_at
    ? new Date(alert.created_at).getTime()
    : 0;
}

function AlertIcon({ severity }: { severity: AlertSeverity }) {
  const config = getSeverityConfig(severity);

  return (
    <span
      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${config.iconBg}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0"
      >
        <path
          d="M10 2.5L2.5 16.25H17.5L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 7V10.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="13.5" r="0.8" fill="currentColor" />
      </svg>

      <span
        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-[1.5px] border-white dark:border-gray-900 ${config.dot}`}
      />
    </span>
  );
}

export default function NotificationDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionNewAlertIds, setSessionNewAlertIds] = useState<Set<string>>(
    new Set()
  );
  const [hasNewAlertEffect, setHasNewAlertEffect] = useState(false);
  const [hasWarehouseCriticalEffect, setHasWarehouseCriticalEffect] =
    useState(false);
  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false);

  const initializedUnreadIdsRef = useRef<Set<string>>(new Set());

  const { data: alerts = [], isLoading } = useAlerts();
  const { data: unreadCount = 0 } = useUnreadAlertsCount();
  const { mutateAsync: markAsRead } = useMarkAlertAsRead();

  useEffect(() => {
    if (initializedUnreadIdsRef.current.size > 0) return;

    const unreadIds = alerts
      .filter((alert) => alert.status === "unread")
      .map((alert) => String(alert.id));

    initializedUnreadIdsRef.current = new Set(unreadIds);
  }, [alerts]);

  useEffect(() => {
    const url = new URL("http://localhost:3001/.well-known/mercure");
    url.searchParams.append("topic", "alerts/general");

    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      try {
        const data: MercurePayload = JSON.parse(event.data);

        if (!data.alert) return;

        const alert = data.alert;
        const alertId = String(alert.id);

        upsertAlertInCache(queryClient, alert);

        const wasAlreadyPresentAtLoad =
          initializedUnreadIdsRef.current.has(alertId);

        if (alert.status === "unread" && !wasAlreadyPresentAtLoad) {
          setSessionNewAlertIds((prev) => {
            const next = new Set(prev);
            next.add(alertId);
            return next;
          });

          setHasNewAlertEffect(true);

          setTimeout(() => {
            setHasNewAlertEffect(false);
          }, 3000);
        }

        if (
          alert.type === "WAREHOUSE_CAPACITY_HIGH" &&
          (alert.severity === "critical" || alert.severity === "warning")
        ) {
          setHasWarehouseCriticalEffect(true);
          setIsOpen(true);

          setTimeout(() => {
            setHasWarehouseCriticalEffect(false);
          }, 4000);
        }
      } catch (error) {
        console.error("Erreur parsing Mercure header:", error);
      }
    };

    eventSource.onerror = () => {
  console.warn("Mercure indisponible pour le moment.");
};

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const recentAlerts = useMemo(() => {
    const uniqueAlerts = Array.from(
      new Map(alerts.map((alert) => [String(alert.id), alert])).values()
    );

    return uniqueAlerts
      .filter((alert) => alert.status !== "archived")
      .sort((a, b) => alertDateValue(b) - alertDateValue(a))
      .slice(0, 6);
  }, [alerts]);

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      setHasOpenedDropdown(true);
      setSessionNewAlertIds(new Set());
      setHasNewAlertEffect(false);
      setHasWarehouseCriticalEffect(false);
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleAlertClick = async (alert: Alert) => {
    try {
      if (alert.status === "unread") {
        await markAsRead(alert.id);
        markAlertAsReadInCache(queryClient, alert.id);
      }

      closeDropdown();

      if (alert.action_url) {
        router.push(alert.action_url);
      } else {
        router.push("/notifications");
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture de l'alerte :", error);
    }
  };

  const displayCount = hasOpenedDropdown
    ? sessionNewAlertIds.size
    : unreadCount;

  const buttonClass = hasWarehouseCriticalEffect
    ? "border-red-500 bg-red-50 text-red-600 shadow-[0_0_0_8px_rgba(239,68,68,0.18)] animate-bounce dark:bg-red-500/10 dark:text-red-400"
    : hasNewAlertEffect
    ? "scale-110 border-orange-400 bg-white text-orange-600 shadow-[0_0_0_6px_rgba(251,146,60,0.18)] dark:bg-gray-900 dark:text-orange-400"
    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white";

  const badgeClass = hasWarehouseCriticalEffect
    ? "bg-red-600"
    : "bg-orange-500";

  const badgePingClass = hasWarehouseCriticalEffect
    ? "bg-red-400"
    : "bg-orange-400";

  return (
    <div className="relative">
      <button
        className={`relative dropdown-toggle flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${buttonClass}`}
        onClick={toggleDropdown}
      >
        {displayCount > 0 && (
          <span
            className={`absolute right-0 top-0.5 z-10 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${badgeClass}`}
          >
            {displayCount > 99 ? "99+" : displayCount}
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${badgePingClass}`}
            ></span>
          </span>
        )}

        {hasWarehouseCriticalEffect && (
          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping"></span>
        )}

        {hasNewAlertEffect && !hasWarehouseCriticalEffect && (
          <span className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping"></span>
        )}

        <svg
          className={`fill-current transition-transform duration-300 ${
            hasWarehouseCriticalEffect || hasNewAlertEffect
              ? "animate-pulse"
              : ""
          }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={toggleDropdown}
            className="dropdown-toggle text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className={`fill-current ${
                hasWarehouseCriticalEffect ? "animate-pulse text-red-500" : ""
              }`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <ul className="flex h-auto flex-col overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <li className="rounded-lg px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Chargement des alertes...
            </li>
          ) : recentAlerts.length === 0 ? (
            <li className="rounded-lg px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucune alerte disponible.
            </li>
          ) : (
            recentAlerts.map((alert) => {
              const severity = getSeverityConfig(alert.severity);

              return (
                <li key={alert.id}>
                  <DropdownItem
                    onItemClick={() => handleAlertClick(alert)}
                    className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  >
                    <AlertIcon severity={alert.severity} />

                    <span className="block min-w-0 flex-1">
                      <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                        <span className="mb-1 block font-medium text-gray-800 dark:text-white/90">
                          {alert.title}
                        </span>
                        <span className="line-clamp-2 block">
                          {alert.message}
                        </span>
                      </span>

                      <span className="flex flex-wrap items-center gap-2 text-theme-xs text-gray-500 dark:text-gray-400">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-white/10">
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 ${severity.badge}`}
                        >
                          {severity.label}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                        <span>{formatRelativeTime(alert.created_at)}</span>
                        {alert.status === "unread" && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                            <span className="font-medium text-brand-500">
                              Non lu
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              );
            })
          )}
        </ul>

        <Link
          href="/notifications"
          onClick={() => {
            setSessionNewAlertIds(new Set());
            setHasOpenedDropdown(false);
            closeDropdown();
          }}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir toutes les notifications
        </Link>
      </Dropdown>
    </div>
  );
}