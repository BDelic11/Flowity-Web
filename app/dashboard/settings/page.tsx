"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsGeneralTab } from "@/components/settings/tabs/settings-general-tab";
import { SettingsBusinessTab } from "@/components/settings/tabs/settings-business-tab";
import { SettingsBookingTab } from "@/components/settings/tabs/settings-booking-tab";
import { SettingsProfileTab } from "@/components/settings/tabs/settings-profile-tab";
import { routes } from "@/constants/routes";
import PageLayout from "@/components/ui/page-layout";
import { useAuth } from "@/contexts/auth-context";
import { useGetOrganization } from "@/app/api/hooks/organizations/useGetOrganization";
import Loading from "@/components/ui/loading";
import { useLocale } from "@/contexts/locale-context";
import { Roles } from "@/constants/roles";

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  const isWorker = user?.role === Roles.WORKER;

  // Only fetch org data for admins — workers don't need it
  const { data: organization, isLoading: isOrgLoading } = useGetOrganization(
    isWorker ? null : user?.organizationId
  );

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace(routes.login);
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) return <Loading />;
  if (!user) return null;

  // ── Worker: profile-only settings ────────────────────────────────────────
  if (isWorker) {
    const nameParts = (user.name ?? "").split(" ");
    return (
      <PageLayout>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
          <p className="text-muted-foreground">{t("settings.profile.description")}</p>
        </div>
        <SettingsProfileTab
          initial={{
            firstName: nameParts[0] ?? "",
            lastName: nameParts.slice(1).join(" ") ?? "",
            phone: "",
            email: user.email,
          }}
        />
      </PageLayout>
    );
  }

  // ── Admin / SuperAdmin: full settings ────────────────────────────────────
  if (isOrgLoading || !organization) return <Loading />;

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("settings.tabGeneral")}</TabsTrigger>
          <TabsTrigger value="business">{t("settings.tabBusiness")}</TabsTrigger>
          <TabsTrigger value="booking">{t("settings.tabBooking")}</TabsTrigger>
          <TabsTrigger value="profile">{t("settings.tabProfile")}</TabsTrigger>
        </TabsList>

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

        <TabsContent value="profile">
          <SettingsProfileTab
            initial={{
              firstName: (user.name ?? "").split(" ")[0] ?? "",
              lastName: (user.name ?? "").split(" ").slice(1).join(" ") ?? "",
              phone: "",
              email: user.email,
            }}
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
