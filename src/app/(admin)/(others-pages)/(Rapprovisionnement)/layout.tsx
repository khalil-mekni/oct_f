"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ApprovisionnementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"]}>
      {children}
    </ProtectedRoute>
  );
}