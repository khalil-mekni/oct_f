import type { QueryClient } from "@tanstack/react-query";
import type { Alert, AlertStatus } from "@/lib/notifications.api";

function computeUnreadCount(alerts: Alert[]): number {
  return alerts.filter((a) => a.user_status === "unread").length;
}

export function upsertAlertInCache(
  queryClient: QueryClient,
  incoming: Alert
): void {
  queryClient.setQueryData<Alert[]>(["alerts"], (old = []) => {
    const next = [...old];

    const index = next.findIndex(
      (a) => String(a.id) === String(incoming.id)
    );

    if (index >= 0) {
      next[index] = {
        ...next[index],
        ...incoming,
      };
    } else {
      next.unshift(incoming);
    }

    queryClient.setQueryData<number>(
      ["alerts-unread-count"],
      computeUnreadCount(next)
    );

    return next;
  });
}

export function markAlertAsReadInCache(
  queryClient: QueryClient,
  alertId: string
): void {
  queryClient.setQueryData<Alert[]>(["alerts"], (old = []) => {
    const now = new Date().toISOString();
    const readStatus: AlertStatus = "read";

    const next: Alert[] = old.map((alert) =>
      String(alert.id) === String(alertId)
        ? {
            ...alert,
            user_status: readStatus,
            user_read_at: now,
            updated_at: now,
          }
        : alert
    );

    queryClient.setQueryData<number>(
      ["alerts-unread-count"],
      computeUnreadCount(next)
    );

    return next;
  });
}

export function archiveAlertInCache(
  queryClient: QueryClient,
  alertId: string
): void {
  queryClient.setQueryData<Alert[]>(["alerts"], (old = []) => {
    const now = new Date().toISOString();
    const archivedStatus: AlertStatus = "archived";

    const next: Alert[] = old.map((alert) =>
      String(alert.id) === String(alertId)
        ? {
            ...alert,
            user_status: archivedStatus,
            user_archived_at: now,
            updated_at: now,
          }
        : alert
    );

    queryClient.setQueryData<number>(
      ["alerts-unread-count"],
      computeUnreadCount(next)
    );

    return next;
  });
}

export function markAllAlertsAsReadInCache(
  queryClient: QueryClient
): void {
  queryClient.setQueryData<Alert[]>(["alerts"], (old = []) => {
    const now = new Date().toISOString();
    const readStatus: AlertStatus = "read";

    const next: Alert[] = old.map((alert) =>
      alert.user_status === "unread"
        ? {
            ...alert,
            user_status: readStatus,
            user_read_at: now,
            updated_at: now,
          }
        : alert
    );

    queryClient.setQueryData<number>(
      ["alerts-unread-count"],
      computeUnreadCount(next)
    );

    return next;
  });
}