import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { apiRoutes } from "@/constants/routes";

export type CustomerNote = {
  id: string;
  content: string;
  createdByUserId: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export const useCustomerNotes = (customerId: string | null | undefined) => {
  return useQuery<CustomerNote[]>({
    queryKey: ["customerNotes", customerId],
    queryFn: async () => {
      const res = await api.get(apiRoutes.customerNotes(customerId!));
      return res.data;
    },
    enabled: !!customerId,
  });
};

export const useAddCustomerNote = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(apiRoutes.customerNotes(customerId), { content });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerNotes", customerId] }),
  });
};

export const useUpdateCustomerNote = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      await api.put(`${apiRoutes.customerNotes(customerId)}/${noteId}`, { content });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerNotes", customerId] }),
  });
};

export const useDeleteCustomerNote = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`${apiRoutes.customerNotes(customerId)}/${noteId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customerNotes", customerId] }),
  });
};
