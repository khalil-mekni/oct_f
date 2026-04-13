export type DashboardOverview = {
  totalWarehouses: number;
  totalStock: number;
  totalCapacity: number;
  totalAvailableCapacity: number;
  capacityUsageRate: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  unreadAlertsCount: number;
  warningAlertsCount: number;
};

export type WarehouseCapacityItem = {
  id: string;
  nom: string;
  adresse?: string | null;
  capacite_totale: number;
  stock_existant: number;
  capacite_disponible: number;
  statut?: string | null;
  fillRate: number;
  level: string;
};

export type AlertItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  status: "unread" | "read" | "archived";
  entity_type?: string | null;
  entity_id?: number | null;
  action_url?: string | null;
  is_active: boolean;
  read_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AlertsSummary = {
  total: number;
  unread: number;
  read: number;
  archived: number;
  info: number;
  warning: number;
  critical: number;
};

export type RecentMovementItem = {
  id: string;
  code_mouvement?: string | null;
  type: string;
  type_mouvement: string;
  quantite: number;
  statut?: string | null;
  date_mouvement?: string | null;
  created_at?: string | null;
  sourceWarehouseName?: string | null;
  destinationWarehouseName?: string | null;
  lot_code?: string | null;
  emballage_code?: string | null;
  emballage_name?: string | null;
  user_name?: string | null;
};

export type StockMovementStatItem = {
  label: string;
  in_count: number;
  out_count: number;
  transfer_count: number;
  loss_count: number;
};


export type WarehouseLotItem = {
  id: string;
  quantite: number;
  lot?: {
    id: string;
    code_lot: string;
  } | null;
  emballage?: {
    id: string;
    code?: string | null;
    name?: string | null;
  } | null;
};

export type WarehouseDetailedItem = {
  id: string;
  nom: string;
  adresse?: string | null;
  capacite_totale: number;
  stock_existant: number;
  capacite_disponible: number;
  statut?: string | null;
  fillRate: number;
  level: "normal" | "warning" | "critical";
  entrepotLots: WarehouseLotItem[];
};

export type ContractWidgetItem = {
  id: string;
  reference: string;
  title?: string | null;
  partnerName?: string | null;
  endDate?: string | null;
  status: string;
};

export type ContractsWidgetData = {
  totalContracts: number;
  activeContracts: number;
  expiringSoon: number;
  contractAlerts: number;
  recentContracts: ContractWidgetItem[];
};

export type DeliveryNoteWidgetItem = {
  id: string;
  numero_bl: string;
  commandeReference?: string | null;
  entrepotName?: string | null;
  date_reception?: string | null;
  statut: string;
};

export type DeliveryNotesWidgetData = {
  total: number;
  validated: number;
  pending: number;
  warehousesInvolved: number;
  recentDeliveryNotes: DeliveryNoteWidgetItem[];
};

export type OrderWidgetItem = {
  id: string;
  reference: string;
  supplierName?: string | null;
  date?: string | null;
  status: string;
  totalLabel?: string | null;
};

export type OrdersWidgetData = {
  total: number;
  pending: number;
  partiallyReceived: number;
  late: number;
  recentOrders: OrderWidgetItem[];
};