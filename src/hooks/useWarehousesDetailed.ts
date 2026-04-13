import { useQuery } from "@tanstack/react-query";
import { getWarehousesDetailed } from "@/lib/dashboard-api";

export const useWarehousesDetailed = () => {
  return useQuery({
    queryKey: ["warehouses-detailed"],
    queryFn: () => getWarehousesDetailed(),
    refetchInterval: 30000,
  });
};