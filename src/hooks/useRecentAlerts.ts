import { useQuery } from "@tanstack/react-query";
import { getRecentAlerts } from "@/lib/dashboard-api";

export function useRecentAlerts(limit = 5) {
  return useQuery({
    queryKey: ["recent-alerts", limit],
    queryFn: () => getRecentAlerts(limit),
    refetchInterval: 30000,
  });
}