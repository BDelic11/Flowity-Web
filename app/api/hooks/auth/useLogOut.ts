"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export const logout = async (): Promise<void> => {
  await api.post(apiRoutes.logout);
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const clearSession = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    window.location.href = "/login";
  };

  return useMutation<void, unknown>({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
    },
    onError: () => {
      // Even if the backend call fails, clear local state
      clearSession();
    },
  });
};
