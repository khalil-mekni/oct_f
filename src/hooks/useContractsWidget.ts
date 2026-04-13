import { useQuery } from "@tanstack/react-query";
import { getContractsWidget } from "@/lib/dashboard-api";

export const useContractsWidget = () => {
  return useQuery({
    queryKey: ["contracts-widget"],
    queryFn: () => getContractsWidget(),
    refetchInterval: 30000,
  });
};