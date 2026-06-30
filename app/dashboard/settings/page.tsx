"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsGeneralTab } from "@/components/settings/tabs/settings-general-tab";
import { SettingsBusinessTab } from "@/components/settings/tabs/settings-business-tab";
import { SettingsBookingTab } from "@/components/settings/tabs/settings-booking-tab";
import { routes } from "@/constants/routes";
import PageLayout from "@/components/ui/page-layout";
import { useAuth } from "@/contexts/auth-context";
import { useGetOrganization } from "@/app/api/hooks/organizations/useGetOrganization";
import { useGetSubscription, useChoosePlan, PLAN_META, type SubscriptionPlan } from "@/app/api/hooks/subscriptions/useGetSubscription";
import { useCreateCheckoutSession, useCreatePortalSession } from "@/app/api/hooks/subscriptions/useStripe";
import Loading from "@/components/ui/loading";
import { useLocale } from "@/contexts/locale-context";
import { Roles } from "@/constants/roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Subscription tab ──────────────────────────────────────────────────────────

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  const warn = pct >= 90;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", warn && "text-destructive")}>
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full transition-all", warn ? "bg-destructive" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const PLANS: SubscriptionPlan[] = ["Basic", "Pro", "Business"];
const PLAN_PRICES: Record<SubscriptionPlan, number> = { Basic: 15, Pro: 35, Business: 69 };

function SubscriptionTab() {
  const { data: sub, isLoading } = useGetSubscription();
  const { mutateAsync: choosePlan } = useChoosePlan();
  const { mutateAsync: createCheckout } = useCreateCheckoutSession();
  const { mutateAsync: createPortal } = useCreatePortalSession();
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(plan: SubscriptionPlan) {
    setLoading(plan);
    try {
      // If there's already a Stripe sub, redirect to the portal so the user can change plans there.
      if (sub?.hasStripeSubscription) {
        const url = await createPortal();
        window.location.href = url;
        return;
      }
      // Otherwise start checkout (will fall back to local plan change if Stripe not configured).
      try {
        const url = await createCheckout(plan);
        window.location.href = url;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 400 && status !== 500) throw err;
        await choosePlan(plan);
        toast.success("Plan promijenjen!");
      }
    } catch {
      toast.error("Nešto je pošlo po krivu.");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const url = await createPortal();
      window.location.href = url;
    } catch {
      toast.error("Stripe portal nije dostupan.");
      setPortalLoading(false);
    }
  }

  if (isLoading || !sub) return <Loading />;

  const trialEnd = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const trialActive = trialEnd && trialEnd > new Date();
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000))
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Current plan summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Trenutni plan</CardTitle>
              <CardDescription>
                {trialActive
                  ? `Probno razdoblje — još ${daysLeft} ${daysLeft === 1 ? "dan" : "dana"}`
                  : "Aktivan plan"}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {sub.plan ?? "–"} · {PLAN_PRICES[sub.plan as SubscriptionPlan] ?? "–"}€/mj.
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar label="Organizacije"     used={sub.usedOrganizations}     max={sub.maxOrganizations} />
          <UsageBar label="Djelatnici"        used={sub.usedStaff}             max={sub.maxStaff} />
          <UsageBar label="Rezervacije / mj." used={sub.usedBookingsThisMonth} max={sub.maxBookingsPerMonth} />
          <UsageBar label="Klijenti"          used={sub.usedClients}           max={sub.maxClients} />
        </CardContent>
      </Card>

      {/* Plan change */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Promijeni plan</CardTitle>
          <CardDescription>
            {sub.hasStripeSubscription
              ? "Otvara Stripe portal — tamo mijenjate plan, karticu, ili otkazujete."
              : "Nadogradnja stupa na snagu odmah."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {PLANS.map((plan) => {
            const isCurrent = sub.plan === plan;
            return (
              <Button
                key={plan}
                variant={isCurrent ? "secondary" : "outline"}
                disabled={isCurrent || loading !== null}
                onClick={() => handleUpgrade(plan)}
                size="sm"
              >
                {loading === plan ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-3 w-3" />
                )}
                {plan} — {PLAN_PRICES[plan]}€/mj.
                {isCurrent && " (aktivan)"}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Billing portal — only shown once Stripe is hooked up */}
      {sub.hasStripeCustomer && (
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Naplata i kartica</CardTitle>
            <CardDescription>
              Stripe portal — preuzmite račune, promijenite karticu, otkažite pretplatu.
              {sub.cancelAtPeriodEnd && " · Pretplata otkazana — vrijedi do kraja perioda."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManageBilling} disabled={portalLoading} variant="outline">
              {portalLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Otvori Stripe portal
            </Button>
            {sub.stripeStatus && (
              <p className="mt-2 text-xs text-muted-foreground">
                Stripe status: <span className="font-mono">{sub.stripeStatus}</span>
                {sub.currentPeriodEnd && (
                  <> · sljedeća naplata: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  const isWorker = user?.role === Roles.WORKER;

  useEffect(() => {
    if (!isAuthLoading && user && isWorker) {
      router.replace(routes.profile);
    }
  }, [user, isAuthLoading, isWorker, router]);

  const { data: organization, isLoading: isOrgLoading } = useGetOrganization(
    isWorker ? null : user?.organizationId
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace(routes.login);
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || isWorker) return <Loading />;
  if (!user) return null;
  if (isOrgLoading || !organization) return <Loading />;

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max sm:w-fit">
            <TabsTrigger value="general">{t("settings.tabGeneral")}</TabsTrigger>
            <TabsTrigger value="business">{t("settings.tabBusiness")}</TabsTrigger>
            <TabsTrigger value="booking">{t("settings.tabBooking")}</TabsTrigger>
            <TabsTrigger value="subscription">Pretplata</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <SettingsGeneralTab
            organizationId={organization.id}
            initial={{
              name: organization.name,
              email: organization.email,
              phone: organization.phone ?? "",
              address: organization.address ?? "",
            }}
          />
        </TabsContent>

        <TabsContent value="business">
          <SettingsBusinessTab
            organizationId={organization.id}
            initialHours={organization.businessHours}
          />
        </TabsContent>

        <TabsContent value="booking">
          <SettingsBookingTab
            organizationId={organization.id}
            initial={{
              autoConfirmBookings: organization.autoConfirmBookings,
              bufferMinBetweenAppointments: organization.bufferMinBetweenAppointments,
              maxAdvanceDays: organization.maxAdvanceDays,
              minLeadTimeMin: organization.minLeadTimeMin,
            }}
          />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
