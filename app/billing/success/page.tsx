"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { routes } from "@/constants/routes";
import { useConfirmCheckoutSession } from "@/app/api/hooks/subscriptions/useStripe";

function BillingSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const { mutateAsync: confirmCheckout } = useConfirmCheckoutSession();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const sessionId = params.get("session_id");

    (async () => {
      try {
        // Synchronously activate the subscription via Stripe's API. Without this we'd be
        // racing the webhook — locally the webhook may never arrive and select-organization
        // bounces the user back to /plans because isActive is still false.
        if (sessionId) {
          await confirmCheckout(sessionId);
        }
      } catch (err) {
        console.error("Stripe confirm failed", err);
        setError("Plaćanje je zaprimljeno, ali aktivacija pretplate kasni. Pričekajte trenutak…");
      } finally {
        await qc.invalidateQueries({ queryKey: ["subscription"] });
        await qc.refetchQueries({ queryKey: ["subscription"] });
        router.replace(routes.selectOrganization);
      }
    })();
  }, [params, confirmCheckout, qc, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            error ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {error ? <AlertCircle className="h-9 w-9" /> : <CheckCircle2 className="h-9 w-9" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {error ? "Skoro gotovo…" : "Pretplata aktivirana!"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {error ?? "Stripe je potvrdio plaćanje. Učitavamo vaš račun…"}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preusmjeravamo vas
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BillingSuccessInner />
    </Suspense>
  );
}
