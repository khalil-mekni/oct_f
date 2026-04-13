import { useQuery } from "@tanstack/react-query";
import { getWarehouseCapacityStats } from "@/lib/dashboard-api";

export function useWarehouseCapacityStats() {
  return useQuery({
    queryKey: ["warehouse-capacity-stats"],
    queryFn: () => getWarehouseCapacityStats(),
    refetchInterval: 30000,
  });
}