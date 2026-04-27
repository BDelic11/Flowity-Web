"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useGetStaffForOrganization } from "@/app/api/hooks/staff/useStaffForTenants";
import { routes } from "@/constants/routes";
import StaffClient from "@/components/staff/staff-client";
import { Roles } from "@/constants/roles";
import Loading from "@/components/ui/loading";

export default function StaffPage() {
  const { user, isLoading, organizationId } = useAuth();
  const router = useRouter();

  const { data: staff = [], isLoading: isStaffLoading } =
    useGetStaffForOrganization(organizationId);

  useEffect(() => {
    if (!isLoading && !user) router.replace(routes.login);
  }, [user, isLoading, router]);

  if (isLoading || isStaffLoading) return <Loading />;
  if (!user || !organizationId) return null;

  const isAdmin = user.role === Roles.ADMIN || user.role === Roles.SUPER_ADMIN;

  return (
    <StaffClient
      staff={staff}
      isAdmin={isAdmin}
      organizationId={organizationId}
    />
  );
}
