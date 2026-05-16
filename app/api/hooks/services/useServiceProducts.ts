import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type ServiceProductResponse = {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
};

export type SetServiceProductsInput = {
  serviceId: string;
  products: { productId: string; quantity: number }[];
};

export const useGetServiceProducts = (serviceId: string | null | undefined) =>
  useQuery<ServiceProductResponse[]>({
    queryKey: ["service-products", serviceId],
    queryFn: async () => {
      const res = await api.get(`/services/${serviceId}/products`);
      return res.data ?? [];
    },
    enabled: !!serviceId,
  });

export const useSetServiceProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, products }: SetServiceProductsInput) => {
      await api.put(`/services/${serviceId}/products`, { products });
    },
    onSuccess: (_, { serviceId }) => {
      qc.invalidateQueries({ queryKey: ["service-products", serviceId] });
    },
  });
};
