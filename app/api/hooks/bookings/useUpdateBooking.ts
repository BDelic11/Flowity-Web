import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export type UpdateBookingPayload = {
  bookingId: string;
  clientName: string;
  startAt: string;  // ISO
  endAt: string;    // ISO
  workerId?: string | null;
  notes?: string | null;
};

const updateBooking = async ({ bookingId, ...body }: UpdateBookingPayload) => {
  await api.patch(`${apiRoutes.bookings}/${bookingId}`, body);
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
