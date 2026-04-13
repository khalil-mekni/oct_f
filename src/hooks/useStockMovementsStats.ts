import { useQuery } from "@tanstack/react-query";
import { getStockMovementsStats } from "@/lib/dashboard-api";

export const useStockMovementsStats = (
  period: "7d" | "14d" | "30d" = "7d"
) => {
  return useQuery({
    queryKey: ["stock-movements-stats", period],
    queryFn: () => getStockMovementsStats(period),
    refetchInterval: 30000,
  });
};