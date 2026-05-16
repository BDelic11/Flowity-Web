"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/app/api/hooks/auth/useVerifyEmail";
import { routes } from "@/constants/routes";
import { useLocale } from "@/contexts/locale-context";

type Status = "loading" | "success" | "error";

function VerifyEmailInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");
  const { mutateAsync } = useVerifyEmail();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setStatus("error");
      return;
    }
    mutateAsync(token).then(
      () => setStatus("success"),
      () => setStatus("error"),
    );
  }, [token, mutateAsync]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmail.checking")}</h1>
            <p className="mt-2 text-muted-foreground">{t("verifyEmail.checkingDesc")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmail.success")}</h1>
            <p className="mt-2 text-muted-foreground">{t("verifyEmail.successDesc")}</p>
            <Button onClick={() => router.push(routes.dashboard)} className="mt-6">
              {t("verifyEmail.continue")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <MailX className="h-9 w-9" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("verifyEmail.error")}</h1>
            <p className="mt-2 text-muted-foreground">{t("verifyEmail.errorDesc")}</p>
            <Button onClick={() => router.push(routes.checkEmail)} variant="outline" className="mt-6">
              {t("verifyEmail.requestNew")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
