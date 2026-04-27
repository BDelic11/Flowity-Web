import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

type UpdateServicePayload = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  priceMin?: number | null;
  priceMax?: number | null;
  isActive: boolean;
  color: string;
  workerIds: string[];
};

const updateService = async (data: UpdateServicePayload): Promise<void> => {
  await api.put(`${apiRoutes.services}/${data.id}`, data);
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
