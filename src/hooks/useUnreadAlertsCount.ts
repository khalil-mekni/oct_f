"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnreadAlertsCount } from "@/lib/notifications.api";

export function useUnreadAlertsCount() {
  return useQuery({
    queryKey: ["alerts-unread-count"],
    queryFn: getUnreadAlertsCount,
    refetchInterval: 15000,
  });
}