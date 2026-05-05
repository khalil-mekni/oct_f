import DashboardHeader from "../DashboardHeader";
import LogisticsMetrics from "../LogisticsMetrics";
import WarehouseOccupancyInteractive from "../WarehouseOccupancyInteractive";
import StockMovementsChart from "../StockMovementsChart";
import StockArchiveWidget from "../StockArchiveWidget";

export default function StockageDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <DashboardHeader />

      {/* ── KPI strip ── */}
      <LogisticsMetrics />

      {/* ── Warehouse occupancy — needs full width to breathe ── */}
      <WarehouseOccupancyInteractive />

      {/* ── Chart (8 cols) + Archive (4 cols) ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <StockMovementsChart />
        </div>
        <div className="xl:col-span-4">
          <StockArchiveWidget />
        </div>
      </div>

      {/* ── Timeline — full width ── */}
  
    </div>
  );
}