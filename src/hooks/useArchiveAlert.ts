"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveAlert } from "@/lib/notifications.api";

export function useArchiveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
    },
  });
}