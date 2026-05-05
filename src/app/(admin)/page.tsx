"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LogisticsMetrics from "@/components/dashboard/LogisticsMetrics";
import WarehouseOccupancyInteractive from "@/components/dashboard/WarehouseOccupancyInteractive";
import StockMovementsChart from "@/components/dashboard/StockMovementsChart";
import ContractsWidget from "@/components/dashboard/ContractsWidget";
import DeliveryNotesWidget from "@/components/dashboard/DeliveryNotesWidget";
import OrdersWidget from "@/components/dashboard/OrdersWidget";
import StockArchiveWidget from "@/components/dashboard/StockArchiveWidget";
import StockageDashboard from "@/components/dashboard/dashboardRstockage/StockageDashboard";
import ApprovisionnementDashboard from "@/components/dashboard/dashboardRd'appro/ApprovisionnementDashboard";

// ────────────────────────────────────────────────────────────────
// Admin layout
// ────────────────────────────────────────────────────────────────
function AdminDashboard() {
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
       

      {/* Warehouse map — needs all 12 columns */}
      <WarehouseOccupancyInteractive />

      {/* Movements chart (8) + Archive (4) */}
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

// ────────────────────────────────────────────────────────────────
// Page shell — handles auth routing + global background
// ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      // Loading screen — adapts to theme automatically
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-teal-500 dark:border-t-teal-400" />
            <div className="absolute inset-2 animate-ping rounded-full bg-teal-400/20" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
            Chargement du tableau de bord…
          </p>
        </div>
      </div>
    );
  }

  return (
    // ── Page background ──────────────────────────────────────────
    // Light: subtle warm-white with a faint grid pattern
    // Dark:  deep slate-950 with a faint dot grid
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Dot-grid pattern — light */}
      <div
        className="pointer-events-none fixed inset-0 dark:hidden opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Dot-grid pattern — dark */}
      <div
        className="pointer-events-none fixed inset-0 hidden dark:block opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient glows — light */}
      <div className="pointer-events-none fixed -top-40 right-1/4 h-96 w-96 rounded-full bg-blue-300/20 dark:bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-80 w-80 rounded-full bg-teal-300/15 dark:bg-teal-600/6 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-20 h-64 w-64 rounded-full bg-violet-300/10 dark:bg-violet-600/5 blur-3xl" />

      {/* Content */}
      <div className="relative mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {user?.role === "ADMIN" && <AdminDashboard />}
        {user?.role === "RESPONSABLE_STOCKAGE" && <StockageDashboard />}
        {user?.role === "RESPONSABLE_APPROVISIONNEMENT" && (
          <ApprovisionnementDashboard />
        )}
      </div>
    </div>
  );
}