"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChoosePlan, useGetSubscription, type SubscriptionPlan } from "@/app/api/hooks/subscriptions/useGetSubscription";
import { useCreateCheckoutSession } from "@/app/api/hooks/subscriptions/useStripe";
import { routes } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanDef = {
  id: SubscriptionPlan;
  name: string;
  price: number;
  tagline: string;
  highlight?: boolean;
  limits: {
    organizations: number;
    staff: number;
    bookingsPerMonth: number;
    clients: number;
  };
  features: string[];
};

const PLANS: PlanDef[] = [
  {
    id: "Basic",
    name: "Basic",
    price: 15,
    tagline: "Za jedan salon",
    limits: { organizations: 1, staff: 5, bookingsPerMonth: 500, clients: 1_000 },
    features: [
      "1 organizacija",
      "Do 5 djelatnika",
      "500 rezervacija / mj.",
      "1 000 klijenata",
      "WhatsApp AI asistent",
      "CSV izvoz podataka",
    ],
  },
  {
    id: "Pro",
    name: "Pro",
    price: 35,
    tagline: "Za rastuće salone",
    highlight: true,
    limits: { organizations: 3, staff: 15, bookingsPerMonth: 2_000, clients: 5_000 },
    features: [
      "Do 3 organizacije",
      "Do 15 djelatnika",
      "2 000 rezervacija / mj.",
      "5 000 klijenata",
      "WhatsApp AI asistent",
      "CSV izvoz podataka",
      "Više lokacija",
    ],
  },
  {
    id: "Business",
    name: "Business",
    price: 69,
    tagline: "Za lance salona",
    limits: { organizations: 5, staff: 50, bookingsPerMonth: 10_000, clients: 20_000 },
    features: [
      "Do 5 organizacija",
      "Do 50 djelatnika",
      "10 000 rezervacija / mj.",
      "20 000 klijenata",
      "WhatsApp AI asistent",
      "CSV izvoz podataka",
      "Više lokacija",
      "Prioritetna podrška",
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const { data: subscription } = useGetSubscription();
  const { mutateAsync: choosePlan } = useChoosePlan();
  const { mutateAsync: createCheckout } = useCreateCheckoutSession();
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);

  // Stripe is "configured" if backend has a customer/subscription wired up. If not, fall back to
  // the local trial path so dev works without Stripe credentials.
  const stripeConfigured = subscription?.hasStripeCustomer || subscription?.hasStripeSubscription;

  async function handleSelect(plan: SubscriptionPlan) {
    setLoading(plan);
    try {
      // Try Stripe Checkout first. If backend returns 400 (e.g. price not configured), fall back
      // to local trial activation so dev environments still work.
      try {
        const url = await createCheckout(plan);
        window.location.href = url;
        return;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 400 && status !== 500) throw err;

        // Fallback: activate local trial without Stripe.
        await choosePlan(plan);
        toast.success("Plan aktiviran (probni period). 🎉");
        router.push(routes.selectOrganization);
      }
    } catch {
      toast.error("Nešto je pošlo po krivu. Pokušajte ponovo.");
    } finally {
      setLoading(null);
    }
  }

  const currentPlan = subscription?.plan;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-amber-500" />
          3 mjeseca besplatno za nove korisnike
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Odaberite plan</h1>
        <p className="mt-3 text-muted-foreground text-lg">
          Jedan frizerski termin pokriva cijenu alata. Otkazujete kad god želite.
        </p>
        {!stripeConfigured && (
          <p className="mt-2 text-xs text-amber-600">
            Test način — kartica nije potrebna. Stripe će aktivirati naplatu kad bude konfiguriran.
          </p>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
                  plan.highlight && "border-primary shadow-md ring-1 ring-primary/30"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Najpopularniji
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  <h2 className="text-2xl font-bold">{plan.name}</h2>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}€</span>
                    <span className="text-muted-foreground">/mj.</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prve 3 mj. besplatno, zatim {plan.price}€/mj.
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(plan.id)}
                  disabled={isLoading || isCurrent}
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Otvaram Stripe...</>
                  ) : isCurrent ? (
                    "Trenutni plan"
                  ) : (
                    "Pokreni pretplatu"
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          90 dana besplatnog probnog razdoblja. Otkažite kad god želite — bez naplate prije isteka.
        </p>
      </div>
    </div>
  );
}
