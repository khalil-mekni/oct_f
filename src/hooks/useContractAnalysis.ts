import { useQuery } from "@tanstack/react-query";
import { getContractAnalysis } from "@/lib/dashboard-api";

export const useContractAnalysis = () => {
  return useQuery({
    queryKey: ["contract-analysis"],
    queryFn: () => getContractAnalysis(),
    refetchInterval: 30000,
  });
};
