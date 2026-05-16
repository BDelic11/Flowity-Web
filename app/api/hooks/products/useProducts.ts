import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import type { Product } from "@/types/product";

export type CreateProductInput = {
  organizationId: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  stockQty: number;
  lowStockThreshold: number;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
};

export type UpdateProductInput = {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  lowStockThreshold: number;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

export type RecordPurchaseInput = {
  productId: string;
  quantity: number;
  unitCost?: number | null;
  note?: string | null;
};

export type AdjustStockInput = {
  productId: string;
  delta: number;
  note?: string | null;
};

export const useGetProducts = (organizationId: string | null | undefined) => {
  return useQuery<Product[]>({
    queryKey: ["products", organizationId],
    queryFn: async () => {
      const res = await api.get(`/products?organizationId=${organizationId}`);
      return res.data ?? [];
    },
    enabled: !!organizationId,
    staleTime: 30_000,
  });
};

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const res = await api.post("/products", input);
      return res.data;
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ["products", input.organizationId] });
    },
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateProductInput) => {
      await api.put(`/products/${id}`, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useRecordPurchase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, ...rest }: RecordPurchaseInput) => {
      await api.post(`/products/${productId}/purchase`, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdjustStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, ...rest }: AdjustStockInput) => {
      await api.post(`/products/${productId}/adjust`, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
