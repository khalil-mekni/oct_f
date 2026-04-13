// app/dashboard/page.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LogisticsMetrics from "@/components/dashboard/LogisticsMetrics";
import WarehouseOccupancyInteractive from "@/components/dashboard/WarehouseOccupancyInteractive";
import StockMovementsChart from "@/components/dashboard/StockMovementsChart";
import AlertsStatisticsChart from "@/components/dashboard/AlertsStatisticsChart";
import WarehouseStatusGrid from "@/components/dashboard/WarehouseStatusGrid";
import MovementsTimeline from "@/components/dashboard/MovementsTimeline";
import ContractsWidget from "@/components/dashboard/ContractsWidget";
import DeliveryNotesWidget from "@/components/dashboard/DeliveryNotesWidget";
import OrdersWidget from "@/components/dashboard/OrdersWidget";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Container principal avec padding et fond */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          
          {/* Grid principal */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* 1. En-tête du dashboard - Pleine largeur */}
            <div className="col-span-12">
              <DashboardHeader />
            </div>

            {/* 2. Métriques logistiques principales - Pleine largeur */}
            <div className="col-span-12">
              <LogisticsMetrics />
            </div>

            {/* 3. Statistiques des alertes et graphique - 2/3 de largeur */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8">
              <AlertsStatisticsChart />
            </div>

            {/* 4. Widget des contrats - 1/3 de largeur */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4">
              <ContractsWidget />
            </div>

            {/* 5. Occupation des entrepôts - Pleine largeur */}
            <div className="col-span-12">
              <WarehouseOccupancyInteractive />
            </div>

            {/* 6. Statut des entrepôts (grille) - Pleine largeur */}
            <div className="col-span-12">
              <WarehouseStatusGrid />
            </div>

            {/* 7. Mouvements de stock - 2/3 de largeur */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8">
              <StockMovementsChart />
            </div>

            {/* 8. Bons de livraison - 1/2 de la ligne suivante */}
            <div className="col-span-12 lg:col-span-6">
              <DeliveryNotesWidget />
            </div>

            {/* 9. Commandes - 1/2 de la ligne suivante */}
            <div className="col-span-12 lg:col-span-6">
              <OrdersWidget />
            </div>

            {/* 10. Timeline des mouvements - Pleine largeur */}
            <div className="col-span-12">
              <MovementsTimeline />
            </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}