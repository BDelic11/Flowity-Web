"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { useResendVerification } from "@/app/api/hooks/auth/useVerifyEmail";
import { useLocale } from "@/contexts/locale-context";
import { toast } from "sonner";

export function EmailVerificationBanner({ email }: { email: string }) {
  const { t } = useLocale();
  const { mutateAsync, isPending } = useResendVerification();
  const [sent, setSent] = useState(false);

  async function handleResend() {
    try {
      await mutateAsync();
      setSent(true);
      toast.success(t("verifyEmail.resendOk"));
    } catch {
      toast.error(t("verifyEmail.resendFail"));
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex items-center gap-2 min-w-0">
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {t("verifyEmail.banner")}{" "}
          <span className="font-medium">{email}</span>
        </span>
      </div>
      <button
        onClick={handleResend}
        disabled={isPending || sent}
        className="shrink-0 rounded-md px-3 py-1 text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="inline h-3 w-3 animate-spin" />
        ) : sent ? (
          t("verifyEmail.resent")
        ) : (
          t("verifyEmail.bannerCta")
        )}
      </button>
    </div>
  );
}
