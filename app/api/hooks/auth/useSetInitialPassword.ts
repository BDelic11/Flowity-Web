import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

type SetInitialPasswordPayload = { token: string; password: string };
type SetInitialPasswordResponse = { access_token: string };

export const useSetInitialPassword = () => {
  const qc = useQueryClient();
  return useMutation<SetInitialPasswordResponse, unknown, SetInitialPasswordPayload>({
    mutationFn: async (data) => {
      const res = await api.post("/auth/set-initial-password", data);
      return res.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      await qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
