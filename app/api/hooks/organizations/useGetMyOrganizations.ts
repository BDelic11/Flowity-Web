import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  isActive: boolean;
};

export const useGetMyOrganizations = () => {
  return useQuery<OrganizationSummary[]>({
    queryKey: ["myOrganizations"],
    queryFn: async () => {
      const res = await api.get("/organizations/mine");
      return res.data ?? [];
    },
    staleTime: 30_000,
  });
};
