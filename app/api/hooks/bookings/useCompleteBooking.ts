import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export const useCompleteBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      await api.post(`/bookings/${bookingId}/complete`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
};
