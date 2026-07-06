import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type Customer = {
  id: string;
  displayName: string;
  phoneE164: string;
  email: string | null;
  isBlocked: boolean;
  gdprConsentAt: string | null;
  createdAt: string;
  bookingCount: number;
};

type GetCustomersResponse = {
  items: Customer[];
  total: number;
};

export const useGetCustomers = (page = 1, pageSize = 50) => {
  return useQuery<GetCustomersResponse>({
    queryKey: ["customers", page, pageSize],
    queryFn: async () => {
      const response = await api.get(`/customers?page=${page}&pageSize=${pageSize}`);
      return response.data;
    },
  });
};

export type CreateCustomerInput = {
  displayName: string;
  phone: string;
  email?: string;
};

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCustomerInput) => {
      const res = await api.post("/customers", input);
      return res.data as { id: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
};
