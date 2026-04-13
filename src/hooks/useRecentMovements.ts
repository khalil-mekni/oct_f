import { useQuery } from "@tanstack/react-query";
import { getRecentMovements } from "@/lib/dashboard-api";

export const useRecentMovements = (limit = 10) => {
  return useQuery({
    queryKey: ["recent-movements", limit],
    queryFn: () => getRecentMovements(limit),
    refetchInterval: 30000,
  });
};