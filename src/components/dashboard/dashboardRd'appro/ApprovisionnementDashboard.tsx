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
      <div className="mt-12 pt-12 border-t-4 border-dashed border-slate-200">
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-full inline-block mb-8 font-bold shadow-lg">
          PROPOSITION : Widgets Simplifiés "Focus Action"
        </div>
        

        
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm italic">
          Note : Ces widgets sont conçus pour une lecture instantanée. Ils filtrent les données pour ne montrer que ce qui nécessite une décision immédiate.
        </div>
      </div>
    </div>
  );
}