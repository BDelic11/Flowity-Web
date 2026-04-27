"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/ui/loading";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(routes.login);
    } else if (!user.organizationId) {
      router.replace("/create-organization");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!user || !user.organizationId) return null;

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col pt-14 md:pt-0 md:pl-16">
        <div className="hidden md:block">
          <DashboardHeader
            userName={user.name || "User"}
            tenantName={user.tenantName || "Salon"}
          />
        </div>
        <main className="flex-1 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
