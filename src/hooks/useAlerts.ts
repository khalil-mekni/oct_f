"use client";

import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "@/lib/notifications.api";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    refetchInterval: 30000,
  });
}