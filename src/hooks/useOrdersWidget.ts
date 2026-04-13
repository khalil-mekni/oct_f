import { useQuery } from "@tanstack/react-query";
import { getOrdersWidget } from "@/lib/dashboard-api";

export const useOrdersWidget = () => {
  return useQuery({
    queryKey: ["orders-widget"],
    queryFn: () => getOrdersWidget(),
    refetchInterval: 30000,
  });
};