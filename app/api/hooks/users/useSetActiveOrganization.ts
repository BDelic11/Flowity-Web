import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useSetActiveOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      await api.post("/users/me/active-organization", { organizationId });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
