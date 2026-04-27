import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export type CreateBookingPayload = {
  organizationId: string;
  clientName: string;
  serviceCatalogItemId: string;
  workerId?: string | null;
  startAt: string;  // ISO
  endAt: string;    // ISO
  notes?: string | null;
};

const createBooking = async (payload: CreateBookingPayload) => {
  const response = await api.post(apiRoutes.bookings, payload);
  return response.data;
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate calendar so the new booking appears immediately
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
