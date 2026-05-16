import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type CreateStaffPayload = {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffPayload) => api.post(apiRoutes.staff, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
