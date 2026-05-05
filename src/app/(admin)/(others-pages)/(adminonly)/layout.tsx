"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminOnlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
}