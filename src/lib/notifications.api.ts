import { graphqlRequest } from "@/lib/graphqlClient";

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "unread" | "read" | "archived";

export type AlertType =
  | "LOW_STOCK"
  | "WAREHOUSE_CAPACITY_HIGH"
  | "INVENTORY_ANOMALY"
  | "SUPPLIER_DELAY"
  | "DELIVERY_IMMINENT"
  | "CONTRAT_EXPIRING"
  | "CONTRACT_EXPIRED"
  | "CONTRACT_CONSUMPTION_HIGH"
  | "CONTRACT_QUANTITY_EXCEEDED"
  | "ORDER_NOT_RECEIVED_ON_TIME";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;

  user_status: AlertStatus;
  user_read_at?: string | null;
  user_archived_at?: string | null;

  entity_type?: string | null;
  entity_id?: string | number | null;
  action_url?: string | null;
  is_active: boolean;
  metadata?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const GET_ALERTS_QUERY = `
  query GetAlerts {
    alerts {
      id
      type
      title
      message
      severity
      user_status
      user_read_at
      user_archived_at
      entity_type
      entity_id
      action_url
      is_active
      created_at
      updated_at
    }
  }
`;

const GET_UNREAD_ALERTS_COUNT_QUERY = `
  query GetUnreadAlertsCount {
    unreadAlertsCount
  }
`;

const MARK_ALERT_AS_READ_MUTATION = `
  mutation MarkAlertAsRead($id: ID!) {
    markAlertAsRead(id: $id) {
      id
      user_status
      user_read_at
    }
  }
`;

const MARK_ALL_ALERTS_AS_READ_MUTATION = `
  mutation MarkAllAlertsAsRead {
    markAllAlertsAsRead
  }
`;

const ARCHIVE_ALERT_MUTATION = `
  mutation ArchiveAlert($id: ID!) {
    archiveAlert(id: $id) {
      id
      user_status
      user_archived_at
    }
  }
`;

export async function getAlerts(): Promise<Alert[]> {
  return graphqlRequest<{ alerts: Alert[] }>(GET_ALERTS_QUERY).then(
    (d) => d.alerts ?? []
  );
}

export async function getUnreadAlertsCount(): Promise<number> {
  return graphqlRequest<{ unreadAlertsCount: number }>(
    GET_UNREAD_ALERTS_COUNT_QUERY
  ).then((d) => d.unreadAlertsCount ?? 0);
}

export async function markAlertAsRead(id: string) {
  return graphqlRequest<{
    markAlertAsRead: {
      id: string;
      user_status: AlertStatus;
      user_read_at?: string | null;
    };
  }>(MARK_ALERT_AS_READ_MUTATION, { id }).then((d) => d.markAlertAsRead);
}

export async function markAllAlertsAsRead() {
  return graphqlRequest<{ markAllAlertsAsRead: boolean }>(
    MARK_ALL_ALERTS_AS_READ_MUTATION
  ).then((d) => d.markAllAlertsAsRead);
}

export async function archiveAlert(id: string) {
  return graphqlRequest<{
    archiveAlert: {
      id: string;
      user_status: AlertStatus;
      user_archived_at?: string | null;
    };
  }>(ARCHIVE_ALERT_MUTATION, { id }).then((d) => d.archiveAlert);
}