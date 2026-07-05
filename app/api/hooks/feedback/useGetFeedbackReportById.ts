import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import type { FeedbackReportDetail } from "@/types/feedback";

export const useGetFeedbackReportById = (id: string | null | undefined) => {
  return useQuery<FeedbackReportDetail>({
    queryKey: ["feedback-reports", id],
    queryFn: async () => {
      const res = await api.get(`/feedback/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};
