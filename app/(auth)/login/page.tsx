"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/app/api/hooks/auth/useLogin";
import { parseApiError } from "@/lib/api-errors";
import { useGoogleAuth } from "@/app/api/hooks/auth/useGoogleAuth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { loginSchema, type LoginValues } from "@/schemas/login";
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
import { Eye, EyeOff } from "lucide-react";
import { routes } from "@/constants/routes";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/ui/loading";
import { useLocale } from "@/contexts/locale-context";
import Image from "next/image";
import logoIconBig from "@/public/logos/large-logo.png";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: loginUser } = useLogin();
  const { mutateAsync: googleLogin, isPending: isGooglePending } =
    useGoogleAuth();
  const justLoggedIn = useRef(false);

  async function handleGoogleSuccess(accessToken: string) {
    justLoggedIn.current = true;
    try {
      const result = await googleLogin(accessToken);
      router.push(result.is_new_user ? routes.plans : routes.dashboard);
    } catch (err) {
      justLoggedIn.current = false;
      const parsed = parseApiError(err, t("auth.googleFailed"));
      setFormError(parsed.message);
    }
  }
  const { t } = useLocale();

  // Redirect already-authenticated users away from this page
  useEffect(() => {
    if (!isLoading && user && !justLoggedIn.current) {
      router.replace(routes.dashboard);
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && !justLoggedIn.current)) return <Loading />;

  function onChange<K extends keyof LoginValues>(key: K, v: LoginValues[K]) {
    setFormError(null);
    setFieldErrors((s) => ({ ...s, [key]: undefined }));
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof LoginValues, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof LoginValues | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setFieldErrors(errs);
      return;
    }

    setIsPending(true);
    try {
      await loginUser(parsed.data);
      router.push(routes.dashboard);
    } catch (error) {
      const parsedErr = parseApiError(error, t("auth.loginFailed"));
      setFieldErrors((s) => ({ ...s, ...parsedErr.fieldErrors }));
      setFormError(parsedErr.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-primary/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <Image
            src={logoIconBig}
            alt={"Logo icon small flowity"}
            width={120}
            height={120}
            className="h-30 w-60 rounded-md object-cover"
          />
          <CardTitle>{t("auth.signIn")}</CardTitle>
          <CardDescription>{t("auth.signInDesc")}</CardDescription>
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
                inputMode="email"
                aria-invalid={!!fieldErrors.email}
                required
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">
                  {t(fieldErrors.email)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={values.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!fieldErrors.password}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={
                    showPw ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded p-2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">
                  {t(fieldErrors.password)}
                </p>
              )}
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("auth.loggingIn") : t("auth.logIn")}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              {t("auth.or")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError(t("auth.googleFailed"))}
            loading={isGooglePending}
            disabled={isPending}
          />

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link
              href={routes.register}
              className="font-medium text-primary hover:underline"
            >
              {t("auth.registerNow")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
