import { useQuery } from "@tanstack/react-query";
import { getDeliveryNotesWidget } from "@/lib/dashboard-api";

export const useDeliveryNotesWidget = () => {
  return useQuery({
    queryKey: ["delivery-notes-widget"],
    queryFn: () => getDeliveryNotesWidget(),
    refetchInterval: 30000,
  });
};