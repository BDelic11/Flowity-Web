import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import type { AuthUser } from "@/contexts/auth-context";

type CurrentUserResponse = {
  id: string;
  organizationId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  isActive: boolean;
};

const getCurrentUser = async (): Promise<AuthUser | null> => {
  // Don't hit the API if there's no token — avoids 401 → refresh → redirect loop
  if (typeof window !== "undefined" && !localStorage.getItem("token")) {
    return null;
  }

  const response = await api.get<CurrentUserResponse>(apiRoutes.me);
  const data = response.data;

  return {
    id: data.id,
    email: data.email,
    name: `${data.firstName} ${data.lastName}`.trim(),
    role: data.role,
    organizationId: data.organizationId ?? null,
    tenantName: "",
  };
};

export const useGetCurrentUser = () => {
  return useQuery<AuthUser | null, Error>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
