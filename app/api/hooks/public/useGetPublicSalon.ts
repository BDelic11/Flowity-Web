import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/utils/publicApi";

export type PublicService = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  priceMin?: number | null;
  priceMax?: number | null;
  color?: string | null;
};

export type PublicStaff = {
  id: string;
  name: string;
};

export type PublicBusinessHour = {
  day: string;
  enabled: boolean;
  open: string;
  close: string;
};

export type PublicSalonInfo = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  industry: string;
  services: PublicService[];
  staff: PublicStaff[];
  businessHours: PublicBusinessHour[];
  minLeadTimeMin: number;
  maxAdvanceDays: number;
};

const fetchPublicSalon = async (orgId: string): Promise<PublicSalonInfo> => {
  const { data } = await publicApi.get(`/public/${orgId}/salon`);
  return data;
};

export const useGetPublicSalon = (orgId: string) => {
  return useQuery({
    queryKey: ["public-salon", orgId],
    queryFn: () => fetchPublicSalon(orgId),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
