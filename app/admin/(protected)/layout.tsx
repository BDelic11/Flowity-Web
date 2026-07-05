"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Roles } from "@/constants/roles";
import { routes } from "@/constants/routes";
import Loading from "@/components/ui/loading";
import { AdminHeader } from "@/components/admin/admin-header";

/**
 * Standalone shell for the SuperAdmin panel (ticket triage, etc.) — deliberately
 * separate from app/dashboard/layout.tsx so SuperAdmins don't have to create an
 * organization or hold an active subscription just to review bug reports.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin = user?.role === Roles.SUPER_ADMIN;

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isSuperAdmin) {
      router.replace(routes.adminLogin);
    }
  }, [user, isLoading, isSuperAdmin, router]);

  if (isLoading || !user || !isSuperAdmin) return <Loading />;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
