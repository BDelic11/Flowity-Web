import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type GoogleAuthResponse = {
  access_token: string;
  is_new_user: boolean;
};

export const googleAuth = async (accessToken: string): Promise<GoogleAuthResponse> => {
  const response = await api.post(apiRoutes.googleAuth, { accessToken });
  return response.data;
};

export const useGoogleAuth = () => {
  const queryClient = useQueryClient();

  return useMutation<GoogleAuthResponse, unknown, string>({
    mutationFn: googleAuth,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.access_token);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
