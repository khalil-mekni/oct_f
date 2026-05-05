"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role =
  | "ADMIN"
  | "RESPONSABLE_APPROVISIONNEMENT"
  | "RESPONSABLE_STOCKAGE";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (!allowedRoles.includes(parsedUser.role)) {
      router.push("/unauthorized"); // ou "/"
    }
  }, []);

  return <>{children}</>;
}