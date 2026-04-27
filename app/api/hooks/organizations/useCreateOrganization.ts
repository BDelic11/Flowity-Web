import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export const createOrganization = async (organizationData: {
  name: string;
  industry: string;
  email: string;
  phone?: string;
  address?: string;
}) => {
  const response = await api.post(apiRoutes.createOrganization, organizationData);
  return response.data;
};

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: createOrganization,
    // Toast and error handling are done by the page
  });
};
