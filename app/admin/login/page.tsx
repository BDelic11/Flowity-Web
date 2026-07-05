"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useLogin } from "@/app/api/hooks/auth/useLogin";
import { parseApiError } from "@/lib/api-errors";
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
import { Roles } from "@/constants/roles";
import { useAuth } from "@/contexts/auth-context";
import type { AuthUser } from "@/contexts/auth-context";
import Loading from "@/components/ui/loading";
import logoIconBig from "@/public/logos/large-logo.png";

/**
 * Standalone login for the SuperAdmin panel. Separate page (and separate from the
 * regular /login flow) on purpose — this must not require creating an organization
 * or holding a subscription. Any non-SuperAdmin credentials are rejected here even
 * if they're otherwise valid, and the session is cleared immediately.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { mutateAsync: loginUser } = useLogin();

  // Already logged in as SuperAdmin? Skip straight to the panel.
  useEffect(() => {
    if (!authLoading && user?.role === Roles.SUPER_ADMIN) {
      router.replace(routes.tickets);
    }
  }, [user, authLoading, router]);

  if (authLoading || user?.role === Roles.SUPER_ADMIN) return <Loading />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    setError(null);
    setIsPending(true);
    try {
      await loginUser({ email: email.trim(), password });

      const me = queryClient.getQueryData<AuthUser>(["currentUser"]);
      if (me?.role !== Roles.SUPER_ADMIN) {
        // Valid login, wrong role — don't leave them signed in on this page.
        localStorage.removeItem("token");
        queryClient.setQueryData(["currentUser"], null);
        setError("Ovaj račun nema ovlasti za pristup admin panelu.");
        return;
      }

      router.push(routes.tickets);
    } catch (err) {
      setError(parseApiError(err, "Prijava nije uspjela.").message);
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
            alt="Flowity"
            width={120}
            height={120}
            className="h-30 w-60 rounded-md object-cover"
          />
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Panel
          </CardTitle>
          <CardDescription>Interni pristup — samo za SuperAdmin račune.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-pošta</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Lozinka</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Sakrij lozinku" : "Prikaži lozinku"}
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded p-2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Prijava..." : "Prijavi se"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
