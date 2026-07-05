import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import type { FeedbackStatus, FeedbackPriority } from "@/types/feedback";

export type UpdateFeedbackReportTriageInput = {
  id: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
};

export const useUpdateFeedbackReportTriage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateFeedbackReportTriageInput) => {
      await api.put(`/feedback/${id}/triage`, rest);
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ["feedback-reports"] });
      qc.invalidateQueries({ queryKey: ["feedback-reports", input.id] });
    },
  });
};
