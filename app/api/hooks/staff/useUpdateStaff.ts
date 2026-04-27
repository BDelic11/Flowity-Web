import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type UpdateStaffPayload = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateStaffPayload) =>
      api.put(`${apiRoutes.staff}/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
