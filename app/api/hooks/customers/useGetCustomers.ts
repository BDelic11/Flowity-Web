import { useQuery } from "@tanstack/react-query";
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
