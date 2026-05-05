import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Alert } from "@/lib/notifications.api";

type MercureAlert = Alert;

type MercurePayload = {
  event: "alert.created" | "alert.updated";
  alert?: MercureAlert;
};

function dedupeAlerts(alerts: Alert[]): Alert[] {
  const map = new Map<string, Alert>();

  for (const alert of alerts) {
    map.set(String(alert.id), alert);
  }

  return Array.from(map.values()).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    return dateB - dateA;
  });
}

function computeUnreadCount(alerts: Alert[]): number {
  return alerts.filter((a) => a.user_status === "unread").length;
}

export const useMercureAlerts = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = new URL("http://localhost:3001/.well-known/mercure");
    url.searchParams.append("topic", "alerts/general");

    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      try {
        const data: MercurePayload = JSON.parse(event.data);

        if (!data.alert) return;

        queryClient.setQueryData<Alert[]>(["alerts"], (old = []) => {
  const current = Array.isArray(old) ? old : [];

  const normalizedAlert: Alert = {
    ...data.alert!,
    user_status: data.alert!.user_status ?? "unread",
  };

  const next = dedupeAlerts([normalizedAlert, ...current]);

  queryClient.setQueryData<number>(
    ["alerts-unread-count"],
    computeUnreadCount(next)
  );

  return next;
});
      } catch (error) {
        console.error("Erreur parsing Mercure", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erreur Mercure", error);
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);
};