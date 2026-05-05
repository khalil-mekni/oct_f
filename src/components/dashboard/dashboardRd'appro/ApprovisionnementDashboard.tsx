import DashboardHeader from "../DashboardHeader";
import ContractsWidget from "../ContractsWidget";
import DeliveryNotesWidget from "../DeliveryNotesWidget";
import OrdersWidget from "../OrdersWidget";

export default function ApprovisionnementDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-screen-2xl space-y-6">

        {/* Header full width */}
        <DashboardHeader />

        {/* Main grid: Orders takes left half (wider), Contracts + Delivery stacked on right */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">

          {/* Orders — large, left column (3/5) */}
          <div className="xl:col-span-3">
            <OrdersWidget />
          </div>

          {/* Right column: Contracts on top, Delivery below (2/5) */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            <ContractsWidget />
            <DeliveryNotesWidget />
          </div>
        </div>
      </div>
    </div>
  );
}