"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedRoute
      allowedRoles={[
        "ADMIN",
        "RESPONSABLE_APPROVISIONNEMENT",
        "RESPONSABLE_STOCKAGE",
      ]}
    >
      <ReactQueryProvider>
        <div className="min-h-screen xl:flex dark:bg-gray-900">
          <AppSidebar />
          <Backdrop />

          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            <AppHeader />

            <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
              {children}
            </main>
          </div>
        </div>
      </ReactQueryProvider>
    </ProtectedRoute>
  );
}