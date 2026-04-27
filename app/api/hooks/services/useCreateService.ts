import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";
import { ServiceData } from "@/types/service";

type CreateServicePayload = {
  organizationId: string;
  name: string;
  description?: string | null;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  priceMin?: number | null;
  priceMax?: number | null;
  color: string;
  workerIds: string[];
};

const createService = async (data: CreateServicePayload): Promise<ServiceData> => {
  const response = await api.post(apiRoutes.services, data);
  return response.data;
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
