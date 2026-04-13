import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

type MercureAlert = {
  id: string | number;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  status: "unread" | "read" | "archived";
  entity_type?: string | null;
  entity_id?: string | number | null;
  action_url?: string | null;
  metadata?: Record<string, unknown> | null;
  is_active: boolean;
  read_at?: string | null;
  archived_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type MercurePayload = {
  event: "alert.created" | "alert.updated";
  alert?: MercureAlert;
};

function dedupeAlerts(alerts: MercureAlert[]): MercureAlert[] {
  const map = new Map<string, MercureAlert>();

  for (const alert of alerts) {
    map.set(String(alert.id), alert);
  }

  return Array.from(map.values()).sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
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

        queryClient.setQueryData(["alerts"], (old: MercureAlert[] | undefined) => {
          const current = Array.isArray(old) ? old : [];
          return dedupeAlerts([data.alert!, ...current]);
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