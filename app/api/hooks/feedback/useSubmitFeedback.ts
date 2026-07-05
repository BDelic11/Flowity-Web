import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type FeedbackType = "Bug" | "Suggestion" | "Other";

export type SubmitFeedbackInput = {
  type: FeedbackType;
  title: string;
  message: string;
  pageUrl?: string | null;
  userAgent?: string | null;
  locale?: string | null;
};

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: async (input: SubmitFeedbackInput) => {
      const res = await api.post("/feedback", input);
      return res.data;
    },
  });
};
