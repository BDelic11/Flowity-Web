import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export type UpdateMyProfilePayload = {
  firstName: string;
  lastName: string;
  phone?: string | null;
};

const updateMyProfile = async (payload: UpdateMyProfilePayload): Promise<void> => {
  await api.put(`${apiRoutes.me}`, payload);
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
