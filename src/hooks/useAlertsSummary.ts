import { useQuery } from "@tanstack/react-query";
import { getAlertsSummary } from "@/lib/dashboard-api";

export const useAlertsSummary = () => {
  return useQuery({
    queryKey: ["alerts-summary"],
    queryFn: () => getAlertsSummary(),
    refetchInterval: 30000,
  });
};