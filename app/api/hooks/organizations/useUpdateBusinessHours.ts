import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { BusinessHourRow } from "@/types/organization";

type UpdateBusinessHoursPayload = {
  organizationId: string;
  businessHours: BusinessHourRow[];
};

const updateBusinessHours = async ({ organizationId, businessHours }: UpdateBusinessHoursPayload) => {
  await api.put(`${apiRoutes.organizations}/${organizationId}/business-hours`, { businessHours });
};

export const useUpdateBusinessHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", variables.organizationId] });
    },
  });
};
