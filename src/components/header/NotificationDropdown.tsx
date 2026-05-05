"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
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
        badge: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
        iconBg: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
        label: "Critique",
        ring: "ring-red-200 dark:ring-red-500/30",
      };
    case "warning":
      return {
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
        iconBg: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
        label: "Attention",
        ring: "ring-amber-200 dark:ring-amber-500/30",
      };
    default:
      return {
        dot: "bg-blue-400",
        badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
        iconBg: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
        label: "Info",
        ring: "ring-blue-200 dark:ring-blue-500/30",
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
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `Il y a ${days} j`;
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
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${config.iconBg} ${config.ring}`}
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <path d="M10 2.5L2.5 16.25H17.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 7V10.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="13.5" r="0.8" fill="currentColor"/>
      </svg>
      <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-gray-900 ${config.dot}`}/>
    </span>
  );
}

export default function NotificationDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [sessionNewAlertIds, setSessionNewAlertIds] = useState<Set<string>>(new Set());
  const [hasNewAlertEffect, setHasNewAlertEffect] = useState(false);
  const [hasWarehouseCriticalEffect, setHasWarehouseCriticalEffect] = useState(false);
  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(false);

  const initializedUnreadIdsRef = useRef<Set<string>>(new Set());

  const { data: alerts = [], isLoading } = useAlerts();
  const { data: unreadCount = 0 } = useUnreadAlertsCount();
  const { mutateAsync: markAsRead } = useMarkAlertAsRead();

  useEffect(() => {
    if (initializedUnreadIdsRef.current.size > 0) return;
    const unreadIds = alerts
      .filter((a) => a.user_status === "unread")
      .map((a) => String(a.id));
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

        const wasAlreadyPresent = initializedUnreadIdsRef.current.has(alertId);
        if (alert.user_status === "unread" && !wasAlreadyPresent) {
          setSessionNewAlertIds((prev) => new Set([...prev, alertId]));
          setHasNewAlertEffect(true);
          setTimeout(() => setHasNewAlertEffect(false), 3000);
        }

        if (
          alert.type === "WAREHOUSE_CAPACITY_HIGH" &&
          (alert.severity === "critical" || alert.severity === "warning")
        ) {
          setHasWarehouseCriticalEffect(true);
          // ✅ CORRIGÉ : setIsOpen(true) supprimé — le dropdown ne s'ouvre plus automatiquement.
          // Seule l'animation pulse rouge sur le bouton est déclenchée.
          setTimeout(() => setHasWarehouseCriticalEffect(false), 4000);
        }
      } catch (error) {
        console.error("Erreur parsing Mercure:", error);
      }
    };

    eventSource.onerror = () => console.warn("Mercure indisponible.");
    return () => eventSource.close();
  }, [queryClient]);

  const recentAlerts = React.useMemo(() => {
    const unique = Array.from(
      new Map(alerts.map((a) => [String(a.id), a])).values()
    );
    return unique
      .filter((a) => a.user_status !== "archived")
      .sort((a, b) => alertDateValue(b) - alertDateValue(a))
      .slice(0, 6);
  }, [alerts]);

  const toggleDropdown = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      setHasOpenedDropdown(true);
      setSessionNewAlertIds(new Set());
      setHasNewAlertEffect(false);
      setHasWarehouseCriticalEffect(false);
    }
  };

  const closeDropdown = () => setIsOpen(false);

  const handleAlertClick = async (alert: Alert) => {
    try {
      if (alert.user_status === "unread") {
        await markAsRead(alert.id);
        markAlertAsReadInCache(queryClient, alert.id);
      }
      closeDropdown();
      router.push(alert.action_url || "/notifications");
    } catch (error) {
      console.error("Erreur ouverture alerte:", error);
    }
  };

  const displayCount = hasOpenedDropdown ? sessionNewAlertIds.size : unreadCount;

  const isCritical = hasWarehouseCriticalEffect;
  const isNew = hasNewAlertEffect && !isCritical;

  return (
    <div className="relative">
      <style>{`
        @keyframes notifPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        @keyframes notifNew {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,146,60,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(251,146,60,0); }
        }
        .notif-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid rgba(0,0,0,0.08);
          background: transparent;
          color: #64748b;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .notif-btn:hover {
          background: rgba(0,160,157,0.06);
          border-color: rgba(0,160,157,0.25);
          color: #00A09D;
          transform: translateY(-1px);
        }
        .notif-btn.critical {
          animation: notifPulse 1s ease-in-out infinite;
          border-color: rgba(239,68,68,0.5);
          background: rgba(239,68,68,0.05);
          color: #ef4444;
        }
        .notif-btn.new-alert {
          animation: notifNew 1.2s ease-in-out infinite;
          border-color: rgba(251,146,60,0.4);
          background: rgba(251,146,60,0.04);
          color: #f97316;
        }
        .dark .notif-btn {
          border-color: rgba(255,255,255,0.08);
          color: #94a3b8;
        }
      `}</style>

      <button
        className={`notif-btn dropdown-toggle ${isCritical ? "critical" : isNew ? "new-alert" : ""}`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {displayCount > 0 && (
          <span
            className="absolute -top-1 -right-1 z-10 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white leading-none"
            style={{
              background: isCritical ? "#ef4444" : "#f97316",
              boxShadow: "0 0 0 2px white",
            }}
          >
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}

        <svg className="fill-current" width="18" height="18" viewBox="0 0 20 20">
          <path
            fillRule="evenodd" clipRule="evenodd"
            d="M10.75 2.29a.75.75 0 00-1.5 0v.54a6.38 6.38 0 00-5.63 6.34v5.29H3.33a.75.75 0 000 1.5h13.34a.75.75 0 000-1.5h-.29V9.17a6.38 6.38 0 00-5.63-6.34v-.54zM14.875 14.46V9.17a4.875 4.875 0 00-9.75 0v5.29h9.75zM8 17.71a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 17.71z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[200px] mt-3 flex w-[360px] flex-col rounded-2xl border bg-white p-0 dark:bg-gray-900 sm:w-[380px] lg:right-0"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 40px -8px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,160,157,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(0,160,157,0.1)" }}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29a.75.75 0 00-1.5 0v.54a6.38 6.38 0 00-5.63 6.34v5.29H3.33a.75.75 0 000 1.5h13.34a.75.75 0 000-1.5h-.29V9.17a6.38 6.38 0 00-5.63-6.34v-.54zM14.875 14.46V9.17a4.875 4.875 0 00-9.75 0v5.29h9.75zM8 17.71a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 018 17.71z" fill="#00A09D"/>
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h5>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={closeDropdown}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Alert list */}
        <ul className="flex flex-col overflow-y-auto" style={{ maxHeight: "380px" }}>
          {isLoading ? (
            <li className="flex flex-col gap-2 px-5 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 w-3/4"/>
                    <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 w-1/2"/>
                  </div>
                </div>
              ))}
            </li>
          ) : recentAlerts.length === 0 ? (
            <li className="flex flex-col items-center justify-center gap-3 px-5 py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29a.75.75 0 00-1.5 0v.54a6.38 6.38 0 00-5.63 6.34v5.29H3.33a.75.75 0 000 1.5h13.34a.75.75 0 000-1.5h-.29V9.17a6.38 6.38 0 00-5.63-6.34v-.54z" fill="#94a3b8"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune alerte</p>
              <p className="text-xs text-gray-400">Tout est sous contrôle</p>
            </li>
          ) : (
            recentAlerts.map((alert) => {
              const severity = getSeverityConfig(alert.severity);
              const isUnread = alert.user_status === "unread";

              return (
                <li key={alert.id}>
                  <DropdownItem
                    onItemClick={() => handleAlertClick(alert)}
                    className="group relative flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    {isUnread && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-0.5 rounded-r-full"
                        style={{ background: "#00A09D" }}
                      />
                    )}

                    <AlertIcon severity={alert.severity} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                          {alert.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-gray-400 mt-0.5">
                          {formatRelativeTime(alert.created_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {alert.message}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: "rgba(0,0,0,0.05)", color: "#64748b" }}
                        >
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${severity.badge}`}>
                          {severity.label}
                        </span>
                        {isUnread && (
                          <span
                            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                            style={{ background: "rgba(0,160,157,0.08)", color: "#00A09D" }}
                          >
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  </DropdownItem>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <Link
            href="/notifications"
            onClick={() => {
              setSessionNewAlertIds(new Set());
              setHasOpenedDropdown(false);
              closeDropdown();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all"
            style={{
              background: "rgba(0,160,157,0.07)",
              color: "#00A09D",
              border: "1px solid rgba(0,160,157,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,160,157,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,160,157,0.07)";
            }}
          >
            Voir toutes les notifications
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}