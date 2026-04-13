import { graphqlRequest } from "@/lib/graphqlClient";
import type { WarehouseDetailedItem } from "@/types/dashboard.types";

import type {
  DashboardOverview,
  WarehouseCapacityItem,
  AlertItem,
  AlertsSummary,
  RecentMovementItem,
  StockMovementStatItem,
} from "@/types/dashboard.types";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const query = `
    query GetDashboardOverview {
      dashboardOverview {
        totalWarehouses
        totalStock
        totalCapacity
        totalAvailableCapacity
        capacityUsageRate
        activeAlertsCount
        criticalAlertsCount
        unreadAlertsCount
        warningAlertsCount
      }
    }
  `;

  const data = await graphqlRequest<{ dashboardOverview: DashboardOverview }>(query);
  return data.dashboardOverview;
}

export async function getWarehouseCapacityStats(): Promise<WarehouseCapacityItem[]> {
  const query = `
    query GetWarehouseCapacityStats {
      warehouseCapacityStats {
        id
        nom
        adresse
        capacite_totale
        stock_existant
        capacite_disponible
        statut
        fillRate
        level
      }
    }
  `;

  const data = await graphqlRequest<{ warehouseCapacityStats: WarehouseCapacityItem[] }>(query);
  return data.warehouseCapacityStats;
}

export async function getRecentAlerts(limit = 5): Promise<AlertItem[]> {
  const query = `
    query GetRecentAlerts($limit: Int!) {
      recentAlerts(limit: $limit) {
        id
        type
        title
        message
        severity
        status
        entity_type
        entity_id
        action_url
        is_active
        read_at
        created_at
        updated_at
      }
    }
  `;

  const data = await graphqlRequest<{ recentAlerts: AlertItem[] }>(query, {
    limit,
  });

  return data.recentAlerts;
}

export async function getAlertsSummary(): Promise<AlertsSummary> {
  const query = `
    query GetAlertsSummary {
      alertsSummary {
        total
        unread
        read
        archived
        info
        warning
        critical
      }
    }
  `;

  const data = await graphqlRequest<{ alertsSummary: AlertsSummary }>(query);
  return data.alertsSummary;
}

export async function getRecentMovements(limit = 10): Promise<RecentMovementItem[]> {
  const query = `
    query GetRecentMovements($limit: Int!) {
      recentMovements(limit: $limit) {
        id
        code_mouvement
        type
        type_mouvement
        quantite
        statut
        date_mouvement
        created_at
        sourceWarehouseName
        destinationWarehouseName
        lot_code
        emballage_code
        emballage_name
        user_name
      }
    }
  `;

  const data = await graphqlRequest<{ recentMovements: RecentMovementItem[] }>(query, {
    limit,
  });

  return data.recentMovements;
}

export async function getStockMovementsStats(
  period: "7d" | "14d" | "30d" = "7d"
): Promise<StockMovementStatItem[]> {
  const query = `
    query GetStockMovementsStats($period: String!) {
      stockMovementsStats(period: $period) {
        label
        in_count
        out_count
        transfer_count
        loss_count
      }
    }
  `;

  const data = await graphqlRequest<{ stockMovementsStats: StockMovementStatItem[] }>(
    query,
    { period }
  );

  return data.stockMovementsStats;
}


export async function getWarehousesDetailed(): Promise<WarehouseDetailedItem[]> {
  const query = `
    query GetWarehousesDetailed {
      entrepots {
        id
        nom
        adresse
        capacite_totale
        stock_existant
        capacite_disponible
        statut
        entrepotLots {
          id
          quantite
          lot {
            id
            code_lot
          }
          emballage {
            id
            code
            name
          }
        }
      }
    }
  `;

  const data = await graphqlRequest<{ entrepots: any[] }>(query);

  return data.entrepots.map((warehouse) => {
    const totalCapacity = Number(warehouse.capacite_totale ?? 0);
    const stock = Number(warehouse.stock_existant ?? 0);
    const fillRate =
      totalCapacity > 0 ? Number(((stock / totalCapacity) * 100).toFixed(1)) : 0;

    let level: "normal" | "warning" | "critical" = "normal";
    if (fillRate >= 90) level = "critical";
    else if (fillRate >= 80) level = "warning";

    return {
      id: String(warehouse.id),
      nom: warehouse.nom,
      adresse: warehouse.adresse,
      capacite_totale: Number(warehouse.capacite_totale ?? 0),
      stock_existant: Number(warehouse.stock_existant ?? 0),
      capacite_disponible: Number(warehouse.capacite_disponible ?? 0),
      statut: warehouse.statut,
      fillRate,
      level,
      entrepotLots: (warehouse.entrepotLots ?? []).map((item: any) => ({
        id: String(item.id),
        quantite: Number(item.quantite ?? 0),
        lot: item.lot
          ? {
              id: String(item.lot.id),
              code_lot: item.lot.code_lot,
            }
          : null,
        emballage: item.emballage
          ? {
              id: String(item.emballage.id),
              code: item.emballage.code,
              name: item.emballage.name,
            }
          : null,
      })),
    };
  });
}

import type {
  ContractsWidgetData,
  DeliveryNotesWidgetData,
  OrdersWidgetData,
} from "@/types/dashboard.types";

export async function getContractsWidget(): Promise<ContractsWidgetData> {
  const query = `
    query GetContractsWidget {
      contractsWidget {
        totalContracts
        activeContracts
        expiringSoon
        contractAlerts
        recentContracts {
          id
          reference
          title
          partnerName
          endDate
          status
        }
      }
    }
  `;

  const data = await graphqlRequest<{ contractsWidget: ContractsWidgetData }>(query);
  return data.contractsWidget;
}

export async function getDeliveryNotesWidget(): Promise<DeliveryNotesWidgetData> {
  const query = `
    query GetDeliveryNotesWidget {
      deliveryNotesWidget {
        total
        validated
        pending
        warehousesInvolved
        recentDeliveryNotes {
          id
          numero_bl
          commandeReference
          entrepotName
          date_reception
          statut
        }
      }
    }
  `;

  const data = await graphqlRequest<{ deliveryNotesWidget: DeliveryNotesWidgetData }>(query);
  return data.deliveryNotesWidget;
}

export async function getOrdersWidget(): Promise<OrdersWidgetData> {
  const query = `
    query GetOrdersWidget {
      ordersWidget {
        total
        pending
        partiallyReceived
        late
        recentOrders {
          id
          reference
          supplierName
          date
          status
          totalLabel
        }
      }
    }
  `;

  const data = await graphqlRequest<{ ordersWidget: OrdersWidgetData }>(query);
  return data.ordersWidget;
}