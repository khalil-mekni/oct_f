import { useQuery } from "@tanstack/react-query";
import { listContrats, refreshContratStatuts } from "@/lib/contrats.api";

export const useContrats = () => {
  return useQuery({
    queryKey: ["contrats-list"],
    queryFn: () => listContrats(),
    refetchInterval: 30000,
  });
};

export const useRefreshContratStatuts = () => {
  return useQuery({
    queryKey: ["contrats-refresh-status"],
    queryFn: () => refreshContratStatuts(),
    refetchInterval: 60000, // Refresh every minute
  });
};
