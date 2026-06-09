import DashboardHeader from "../DashboardHeader";
import LogisticsMetrics from "../LogisticsMetrics";
import DeliveryQuantitiesWidget from "../DeliveryQuantitiesWidget";
import OrdersFunnelWidget from "../OrdersFunnelWidget";
import ContractFinancialDashboard from "../ContractFinancialDashboard";

export default function ApprovisionnementDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Top Section: Header & Global Metrics ── */}
      <DashboardHeader />
      <LogisticsMetrics />

      {/* ── Procurement Workflow (Full Width) ── */}
      <OrdersFunnelWidget />

      {/* ── Financial Pilotage (Full Width) ── */}
      <ContractFinancialDashboard />

      {/* ── Details Section: Deliveries ── */}
      <div className="max-w-full">
         <DeliveryQuantitiesWidget />
      </div>

      {/* ── SECTION COMPARAISON (Pour le Jury) ── */}
    
    </div>
  );
}