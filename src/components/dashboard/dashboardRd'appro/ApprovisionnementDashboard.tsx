import DashboardHeader from "../DashboardHeader";
import LogisticsMetrics from "../LogisticsMetrics";
import ContractsTimelineWidget from "../ContractsTimelineWidget";
import DeliveryQuantitiesWidget from "../DeliveryQuantitiesWidget";
import OrdersFunnelWidget from "../OrdersFunnelWidget";

export default function ApprovisionnementDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Top Section: Header & Global Metrics ── */}
      <DashboardHeader />
      <LogisticsMetrics />

      {/* ── Procurement Workflow (Full Width) ── */}
      <OrdersFunnelWidget />

      {/* ── Details Section: Timeline & Quantities ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
         <ContractsTimelineWidget />
         <DeliveryQuantitiesWidget />
      </div>
    </div>
  );
}