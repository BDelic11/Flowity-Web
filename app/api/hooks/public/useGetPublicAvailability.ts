import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/utils/publicApi";

export type TimeSlot = {
  time: string;
  startUtc: string;
  endUtc: string;
};

export type PublicAvailability = {
  date: string;
  slots: TimeSlot[];
};

const fetchAvailability = async (
  orgId: string,
  serviceId: string,
  staffId: string | null,
  date: string
): Promise<PublicAvailability> => {
  const params = new URLSearchParams({ serviceId, date });
  if (staffId) params.set("staffId", staffId);
  const { data } = await publicApi.get(`/public/${orgId}/availability?${params}`);
  return data;
};

export const useGetPublicAvailability = (
  orgId: string,
  serviceId: string | null,
  staffId: string | null,
  date: string | null
) => {
  return useQuery({
    queryKey: ["public-availability", orgId, serviceId, staffId, date],
    queryFn: () => fetchAvailability(orgId, serviceId!, staffId, date!),
    enabled: !!orgId && !!serviceId && !!date,
  });
};
