import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { OrganizationData } from "@/types/organization";

const fetchOrganization = async (id: string): Promise<OrganizationData> => {
  const response = await api.get(`${apiRoutes.organizations}/${id}`);
  return response.data;
};

export const useGetOrganization = (organizationId: string | null | undefined) => {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => fetchOrganization(organizationId!),
    enabled: !!organizationId,
  });
};
