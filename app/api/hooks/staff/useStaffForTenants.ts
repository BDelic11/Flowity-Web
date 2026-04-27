import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { StaffMember } from "@/types/staff";

const fetchStaffForOrganization = async (
  organizationId: string
): Promise<StaffMember[]> => {
  const response = await api.get(
    `${apiRoutes.staff}?organizationId=${organizationId}`
  );
  return response.data.map((m: Omit<StaffMember, "name">) => ({
    ...m,
    name: `${m.firstName} ${m.lastName}`.trim(),
  }));
};

export const useGetStaffForOrganization = (
  organizationId: string | null | undefined
) => {
  return useQuery<StaffMember[]>({
    queryKey: ["staff", organizationId],
    queryFn: () => fetchStaffForOrganization(organizationId!),
    enabled: !!organizationId,
  });
};
