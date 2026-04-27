import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type UpdateOrganizationPayload = {
  organizationId: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

const updateOrganization = async ({ organizationId, ...body }: UpdateOrganizationPayload) => {
  await api.put(`${apiRoutes.organizations}/${organizationId}`, body);
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", variables.organizationId] });
    },
  });
};
