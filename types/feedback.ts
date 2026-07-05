export type FeedbackType = "Bug" | "Suggestion" | "Other";
export type FeedbackStatus = "Active" | "Inactive" | "Done";
export type FeedbackPriority = "Low" | "Medium" | "High";

export const FEEDBACK_STATUSES: FeedbackStatus[] = ["Active", "Inactive", "Done"];
export const FEEDBACK_PRIORITIES: FeedbackPriority[] = ["Low", "Medium", "High"];

export type FeedbackReportListItem = {
  id: string;
  organizationId: string | null;
  userEmail: string | null;
  userName: string | null;
  type: FeedbackType;
  title: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  pageUrl: string | null;
  createdAt: string;
};

export type FeedbackReportDetail = {
  id: string;
  organizationId: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  type: FeedbackType;
  title: string;
  message: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  pageUrl: string | null;
  userAgent: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string | null;
};
