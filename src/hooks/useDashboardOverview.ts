import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "@/lib/dashboard-api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => getDashboardOverview(),
    refetchInterval: 30000,
  });
}