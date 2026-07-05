"use client";

import { useState } from "react";
import { MessageCircleMore, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitFeedback, type FeedbackType } from "@/app/api/hooks/feedback/useSubmitFeedback";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { parseApiError } from "@/lib/api-errors";
import { toast } from "sonner";

const FEEDBACK_TYPES: FeedbackType[] = ["Bug", "Suggestion", "Other"];

/**
 * Small always-on-screen feedback/bug-report widget for internal testers.
 * Lives in the dashboard layout so it's available on every authenticated page.
 * Auto-captures page URL, user agent and locale — the tester only writes a title + message.
 */
export function FeedbackWidget() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const { mutateAsync, isPending } = useSubmitFeedback();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("Bug");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  function reset() {
    setType("Bug");
    setTitle("");
    setMessage("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      await mutateAsync({
        type,
        title: title.trim(),
        message: message.trim(),
        pageUrl: typeof window !== "undefined" ? window.location.href : null,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        locale,
      });
      toast.success(t("feedback.sent"));
      handleOpenChange(false);
    } catch (error) {
      toast.error(parseApiError(error, t("feedback.sendFailed")).message);
    }
  }

  // Only meaningful once we know who's reporting (dashboard is auth-gated anyway).
  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("feedback.openButton")}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 sm:bottom-6 sm:right-6"
      >
        <MessageCircleMore className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t("feedback.title")}</DialogTitle>
            <DialogDescription>{t("feedback.description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="feedback-type">{t("feedback.type")}</Label>
              <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
                <SelectTrigger id="feedback-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TYPES.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`feedback.types.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback-title">{t("feedback.titleLabel")}</Label>
              <Input
                id="feedback-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("feedback.titlePlaceholder")}
                maxLength={200}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedback-message">{t("feedback.messageLabel")}</Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedback.messagePlaceholder")}
                rows={4}
                maxLength={4000}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("feedback.send")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
