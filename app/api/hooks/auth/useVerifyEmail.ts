import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useVerifyEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post("/auth/verify-email", { token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/resend-verification");
    },
  });
};
