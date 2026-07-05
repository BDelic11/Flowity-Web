import { cn } from "@/lib/utils";
import type { FeedbackPriority, FeedbackStatus, FeedbackType } from "@/types/feedback";

const PRIORITY_DOT: Record<FeedbackPriority, string> = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

const PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  High: "Visok",
  Medium: "Srednji",
  Low: "Nizak",
};

export function PriorityDot({
  priority,
  showLabel = true,
}: {
  priority: FeedbackPriority;
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", PRIORITY_DOT[priority])}
        aria-hidden
      />
      {showLabel && <span className="text-sm">{PRIORITY_LABELS[priority]}</span>}
    </span>
  );
}

const STATUS_CLASSES: Record<FeedbackStatus, string> = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-600",
  Done: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  Active: "Aktivno",
  Inactive: "Neaktivno",
  Done: "Riješeno",
};

export function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

const TYPE_LABELS: Record<FeedbackType, string> = {
  Bug: "Bug",
  Suggestion: "Prijedlog",
  Other: "Ostalo",
};

export function TypeBadge({ type }: { type: FeedbackType }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {TYPE_LABELS[type]}
    </span>
  );
}

export { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS };
