"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { routes } from "@/constants/routes";
import Loading from "@/components/ui/loading";
import PageLayout from "@/components/ui/page-layout";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { useGetSalonMetrics } from "@/app/api/hooks/dashboard/useGetSalonMetrics";
import { useLocale } from "@/contexts/locale-context";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const { t } = useLocale();
  const { data: metrics, isLoading: isMetricsLoading } = useGetSalonMetrics(
    user?.organizationId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(routes.login);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <PageLayout>
      <div className="mb-6 ">
        <h2 className="text-3xl font-bold tracking-tight pb-2">
          {t("dashboard.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("dashboard.welcome", { name: user.name })}
        </p>
      </div>

      <DashboardClient metrics={metrics ?? null} isLoading={isMetricsLoading} />
    </PageLayout>
  );
}
