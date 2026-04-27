import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { ServiceData } from "@/types/service";

const fetchServices = async (
  organizationId: string
): Promise<ServiceData[]> => {
  const response = await api.get(
    `${apiRoutes.services}?organizationId=${organizationId}`
  );
  return response.data;
};

export const useGetServices = (organizationId: string | null | undefined) => {
  return useQuery({
    queryKey: ["services", organizationId],
    queryFn: () => fetchServices(organizationId!),
    enabled: !!organizationId,
  });
};
