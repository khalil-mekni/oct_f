"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading } = useAuth();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/unauthorized");
      return;
    }

    setChecking(false);
  }, [loading, token, user, allowedRoles, pathname, router]);

  if (loading || checking) {
    return <div className="p-6">Chargement...</div>;
  }

  return <>{children}</>;
}