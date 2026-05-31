import DashboardHeader from "../DashboardHeader";
import LogisticsMetrics from "../LogisticsMetrics";
import WarehouseOccupancyInteractive from "../WarehouseOccupancyInteractive";
import StockMovementsChart from "../StockMovementsChart";
import StockArchiveWidget from "../StockArchiveWidget";
import DeliveryQuantitiesWidget from "../DeliveryQuantitiesWidget";

export default function StockageDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Header & Global Metrics ── */}
      <DashboardHeader />
      <LogisticsMetrics />

      {/* ── Occupancy Section (Full Width) ── */}
      <div className="w-full">
         <WarehouseOccupancyInteractive />
      </div>
        
      {/* ── Delivery Analysis (Full Width) ── */}
      <div className="w-full">
         <DeliveryQuantitiesWidget />
      </div>

      {/* ── Movements & Trends Section ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <StockMovementsChart />
        </div>
        <div className="xl:col-span-4">
          <StockArchiveWidget />
        </div>
      </div>
    </div>
  );
}