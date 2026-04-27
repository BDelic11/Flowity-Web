"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useRegister,
  getApiErrorMessage,
} from "@/app/api/hooks/auth/useRegister";
import { useGoogleAuth } from "@/app/api/hooks/auth/useGoogleAuth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { registerSchema, type RegisterValues } from "@/schemas/register";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/constants/routes";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/ui/loading";
import { useLocale } from "@/contexts/locale-context";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [values, setValues] = useState<RegisterValues>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: registerUser } = useRegister();
  const { mutateAsync: googleLogin, isPending: isGooglePending } = useGoogleAuth();

  async function handleGoogleSuccess(accessToken: string) {
    justRegistered.current = true;
    try {
      const result = await googleLogin(accessToken);
      if (result.is_new_user) {
        router.push("/create-organization");
      } else {
        router.push(routes.dashboard);
      }
    } catch {
      justRegistered.current = false;
      setFormError(t("auth.googleFailed"));
    }
  }
  const { t } = useLocale();

  const justRegistered = useRef(false);

  useEffect(() => {
    if (!isLoading && user && !justRegistered.current) {
      router.replace(routes.dashboard);
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && !justRegistered.current)) return <Loading />;

  function onChange<K extends keyof RegisterValues>(
    key: K,
    v: RegisterValues[K]
  ) {
    setFormError(null);
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setFormError(
        parsed.error.issues.map((i) => i.message).join(", ") ?? t("auth.invalidInput")
      );
      return;
    }

    setIsPending(true);
    justRegistered.current = true; // suppress the dashboard redirect
    try {
      await registerUser(values);
      router.push("/create-organization");
    } catch (error) {
      justRegistered.current = false;
      setFormError(
        getApiErrorMessage(error, t("auth.registerFailed"))
      );
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.register")}</CardTitle>
          <CardDescription>{t("auth.registerDesc")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="firstName">{t("auth.firstName")}</Label>
              <Input
                id="firstName"
                type="text"
                value={values.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">{t("auth.lastName")}</Label>
              <Input
                id="lastName"
                type="text"
                value={values.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={values.password}
                onChange={(e) => onChange("password", e.target.value)}
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("auth.creatingAccount") : t("auth.register")}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t("auth.or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError(t("auth.googleFailed"))}
            loading={isGooglePending}
            disabled={isPending}
          />

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link
              href={routes.login}
              className="font-medium text-primary hover:underline"
            >
              {t("auth.signInLink")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
