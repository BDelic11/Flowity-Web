import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { SalonMetrics } from "@/types/dashboard";

const fetchSalonMetrics = async (organizationId: string): Promise<SalonMetrics> => {
  const response = await api.get(
    `${apiRoutes.dashboardMetrics}?organizationId=${organizationId}`
  );
  return response.data;
};

export const useGetSalonMetrics = (organizationId: string | null | undefined) => {
  return useQuery({
    queryKey: ["salonMetrics", organizationId],
    queryFn: () => fetchSalonMetrics(organizationId!),
    enabled: !!organizationId,
    refetchInterval: 60_000, // auto-refresh every minute
  });
};
