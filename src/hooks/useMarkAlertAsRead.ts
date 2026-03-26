"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAlertAsRead } from "@/lib/notifications.api";

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAlertAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
    },
  });
}