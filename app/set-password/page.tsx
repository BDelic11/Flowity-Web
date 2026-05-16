"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSetInitialPassword } from "@/app/api/hooks/auth/useSetInitialPassword";
import { getApiErrorMessage } from "@/app/api/hooks/auth/useLogin";
import { routes } from "@/constants/routes";
import { useLocale } from "@/contexts/locale-context";
import { passwordField } from "@/schemas/_shared";
import { z } from "zod";

const formSchema = z
  .object({
    password: passwordField,
    confirm: z.string().min(1, "validation.password.min8"),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "validation.password.mismatch",
  });

function SetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { t } = useLocale();
  const { mutateAsync, isPending } = useSetInitialPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = formSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      const errs: { password?: string; confirm?: string } = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as "password" | "confirm" | undefined;
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (!token) {
      setFormError(t("setPassword.invalidToken"));
      return;
    }

    try {
      await mutateAsync({ token, password });
      router.replace(routes.dashboard);
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("setPassword.failed")));
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <AlertCircle className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("setPassword.invalidTitle")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("setPassword.invalidDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            {t("setPassword.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("setPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isPending}
                aria-invalid={!!fieldErrors.password}
                toggleLabelShow={t("auth.showPassword")}
                toggleLabelHide={t("auth.hidePassword")}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">{t(fieldErrors.password)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("auth.passwordHint")}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                disabled={isPending}
                aria-invalid={!!fieldErrors.confirm}
                toggleLabelShow={t("auth.showPassword")}
                toggleLabelHide={t("auth.hidePassword")}
              />
              {fieldErrors.confirm && (
                <p className="text-xs text-destructive">{t(fieldErrors.confirm)}</p>
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("setPassword.submitting")}
                </>
              ) : (
                t("setPassword.submit")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SetPasswordInner />
    </Suspense>
  );
}
