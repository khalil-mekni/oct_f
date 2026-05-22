"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStockArchiveSummary } from "@/lib/dashboard-api";

export function useStockArchiveSummary() {
  return useQuery({
    queryKey: ["stock-archive-summary"],
    queryFn: fetchStockArchiveSummary,
    refetchInterval: 30000, // 30 seconds
  });
}