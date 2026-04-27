import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type WhatsappChannel = { phoneNumber: string | null; isActive: boolean };

export const useGetWhatsappChannel = (orgId: string | null) =>
  useQuery<WhatsappChannel>({
    queryKey: ["whatsapp-channel", orgId],
    queryFn: async () => {
      const { data } = await api.get(`/whatsapp/admin/channel?organizationId=${orgId}`);
      return data;
    },
    enabled: !!orgId,
  });

export const useSetWhatsappChannel = (orgId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phoneNumber: string) =>
      api.post(`/whatsapp/admin/channel?organizationId=${orgId}`, { phoneNumber }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-channel", orgId] }),
  });
};

export const useIndexEmbeddings = (orgId: string) =>
  useMutation({
    mutationFn: () => api.post(`/whatsapp/admin/index?organizationId=${orgId}`),
  });
