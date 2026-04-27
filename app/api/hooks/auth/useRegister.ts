import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { getApiErrorMessage } from "@/app/api/hooks/auth/useLogin";

type RegisterRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type RegisterResponse = { access_token: string };

export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await api.post(apiRoutes.register, data);
  return response.data;
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, unknown, RegisterRequest>({
    mutationFn: register,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      // Refetch user so auth context is populated with the new account
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    // No onError toast — pages handle inline error display
  });
};

export { getApiErrorMessage };
