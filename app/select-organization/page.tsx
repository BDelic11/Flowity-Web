"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetMyOrganizations } from "@/app/api/hooks/organizations/useGetMyOrganizations";
import { useSetActiveOrganization } from "@/app/api/hooks/users/useSetActiveOrganization";
import { useGetSubscription } from "@/app/api/hooks/subscriptions/useGetSubscription";
import { useAuth } from "@/contexts/auth-context";
import { routes } from "@/constants/routes";
import { cn } from "@/lib/utils";
import Loading from "@/components/ui/loading";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: subscription, isLoading: subLoading } = useGetSubscription();
  const { data: organizations, isLoading: orgsLoading } = useGetMyOrganizations();
  const { mutateAsync: setActive, isPending: isSwitching } = useSetActiveOrganization();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(routes.login);
    }
  }, [authLoading, user, router]);

  // No subscription / inactive plan → must pick plan first
  useEffect(() => {
    if (!subLoading && subscription && (!subscription.isActive || !subscription.plan)) {
      router.replace(routes.plans);
    }
  }, [subLoading, subscription, router]);

  if (authLoading || subLoading || orgsLoading) return <Loading />;

  const orgs = organizations ?? [];
  const maxOrgs = subscription?.maxOrganizations ?? 1;
  const canCreateMore = orgs.length < maxOrgs;

  async function handleSelect(orgId: string) {
    if (isSwitching) return;
    try {
      await setActive(orgId);
      router.push(routes.dashboard);
    } catch {
      toast.error("Greška pri odabiru organizacije.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Odaberite organizaciju</h1>
          <p className="mt-2 text-muted-foreground">
            {orgs.length === 0
              ? "Krenite tako da kreirate svoju prvu organizaciju."
              : "Odaberite na kojoj organizaciji želite raditi."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => handleSelect(org.id)}
              disabled={isSwitching}
              className={cn(
                "group flex flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md disabled:opacity-50",
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{org.name}</p>
                <p className="truncate text-sm text-muted-foreground">{org.industry}</p>
              </div>
              {!org.isActive && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                  Neaktivna
                </span>
              )}
            </button>
          ))}

          {canCreateMore && (
            <button
              type="button"
              onClick={() => router.push("/create-organization")}
              className="flex flex-col items-start gap-3 rounded-xl border-2 border-dashed bg-card p-5 text-left transition-all hover:border-primary hover:bg-accent"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Nova organizacija</p>
                <p className="text-sm text-muted-foreground">
                  {orgs.length}/{maxOrgs} iskorišteno
                </p>
              </div>
            </button>
          )}
        </div>

        {isSwitching && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Učitavanje...
          </div>
        )}

        {orgs.length > 0 && !canCreateMore && (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Iskorišten limit organizacija za vaš plan ({maxOrgs}).{" "}
            <button
              type="button"
              onClick={() => router.push(routes.plans)}
              className="font-medium text-primary hover:underline"
            >
              Nadogradite plan
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
