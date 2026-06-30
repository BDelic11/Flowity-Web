"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CalendarClient } from "@/components/calendar/calendar-client";
import { routes } from "@/constants/routes";
import Loading from "@/components/ui/loading";
import { useLocale } from "@/contexts/locale-context";

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(routes.login);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <Loading />;
  }

  if (!user.organizationId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {t("calendar.noOrganization")}
      </div>
    );
  }

  // Workers see only their own calendar column; admins see all staff
  const workerFilter = user.role === "Worker" ? user.id : undefined;

  return <CalendarClient organizationId={user.organizationId} workerFilter={workerFilter} />;
}
