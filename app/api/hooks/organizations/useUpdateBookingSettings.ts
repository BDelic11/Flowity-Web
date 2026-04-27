import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type UpdateBookingSettingsPayload = {
  organizationId: string;
  autoConfirmBookings: boolean;
  bufferMinBetweenAppointments: number;
  maxAdvanceDays: number;
  minLeadTimeMin: number;
};

const updateBookingSettings = async ({ organizationId, ...body }: UpdateBookingSettingsPayload) => {
  await api.put(`${apiRoutes.organizations}/${organizationId}/booking-settings`, body);
};

export const useUpdateBookingSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookingSettings,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", variables.organizationId] });
    },
  });
};
