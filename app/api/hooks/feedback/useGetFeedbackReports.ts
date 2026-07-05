import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import type { FeedbackReportListItem, FeedbackStatus, FeedbackPriority, FeedbackType } from "@/types/feedback";

export type FeedbackReportFilters = {
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  type?: FeedbackType;
};

type FeedbackReportsResponse = {
  items: FeedbackReportListItem[];
  total: number;
};

export const useGetFeedbackReports = (filters: FeedbackReportFilters = {}) => {
  return useQuery<FeedbackReportsResponse>({
    queryKey: ["feedback-reports", filters],
    queryFn: async () => {
      const res = await api.get("/feedback", { params: filters });
      return res.data ?? { items: [], total: 0 };
    },
    staleTime: 15_000,
  });
};
