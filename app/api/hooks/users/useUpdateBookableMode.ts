import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

type UpdateBookablePayload = {
  enabled: boolean;
  serviceIds: string[];
};

export const useUpdateBookableMode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBookablePayload) => {
      await api.put("/users/me/bookable", data);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["currentUser"] });
      await qc.invalidateQueries({ queryKey: ["staff"] });
      await qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
