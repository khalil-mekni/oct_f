import { useQuery } from "@tanstack/react-query";
import { listContrats } from "@/lib/contrats.api";

export const useContrats = () => {
  return useQuery({
    queryKey: ["contrats-list"],
    queryFn: () => listContrats(),
    refetchInterval: 30000,
  });
};
