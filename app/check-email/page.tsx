"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResendVerification } from "@/app/api/hooks/auth/useVerifyEmail";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { routes } from "@/constants/routes";
import { toast } from "sonner";

export default function CheckEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
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
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg">
          <Mail className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmail.checkInbox")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("verifyEmail.sentTo")}{" "}
          {user?.email && <span className="font-medium text-foreground">{user.email}</span>}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">{t("verifyEmail.clickLink")}</p>

        <div className="mt-8 space-y-3">
          <Button onClick={handleResend} variant="outline" className="w-full" disabled={isPending || sent}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : sent ? (
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
            ) : null}
            {sent ? t("verifyEmail.resent") : t("verifyEmail.resend")}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push(routes.plans)}
          >
            {t("verifyEmail.continueAnyway")}
          </Button>
        </div>
      </div>
    </div>
  );
}
