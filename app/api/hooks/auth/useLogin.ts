import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import axios from "axios";

type LoginRequest = { email: string; password: string };
type LoginResponse = { access_token: string };

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post(apiRoutes.login, data);
  return response.data;
};

/** Pulls the human-readable message out of a backend error response.
 *  Backend shape: { code: string; name: string }
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.name ?? fallback;
  }
  return fallback;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, unknown, LoginRequest>({
    mutationFn: login,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      // Use refetchQueries (not invalidateQueries) so the currentUser query
      // fully completes before the caller does router.push("/dashboard").
      // invalidateQueries only marks stale and resolves immediately — the
      // dashboard guard would see user=null and redirect back to login.
      await queryClient.refetchQueries({ queryKey: ["currentUser"] });
    },
  });
};
