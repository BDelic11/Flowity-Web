import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/utils/publicApi";

export type CreatePublicBookingPayload = {
  clientName: string;
  serviceId: string;
  staffId: string | null;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
  notes?: string | null;
};

const createPublicBooking = async (
  orgId: string,
  payload: CreatePublicBookingPayload
): Promise<{ id: string }> => {
  const { data } = await publicApi.post(`/public/${orgId}/bookings`, payload);
  return data;
};

export const useCreatePublicBooking = (orgId: string) => {
  return useMutation({
    mutationFn: (payload: CreatePublicBookingPayload) =>
      createPublicBooking(orgId, payload),
  });
};
