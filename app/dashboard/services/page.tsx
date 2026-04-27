"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useGetServices } from "@/app/api/hooks/services/useGetServices";
import { useGetStaffForOrganization } from "@/app/api/hooks/staff/useStaffForTenants";
import { routes } from "@/constants/routes";
import ServicesClient from "@/components/services/services-client";
import { Roles } from "@/constants/roles";
import Loading from "@/components/ui/loading";

type StaffBrief = { id: string; name: string };

export default function ServicesPage() {
  const { user, isLoading, organizationId } = useAuth();
  const router = useRouter();

  // Always call hooks — conditional returns must come after
  const { data: services = [], isLoading: isServicesLoading } =
    useGetServices(organizationId);

  // Staff is only needed for the "assign staff" section in the dialog.
  // Its loading state must NOT block the services list from rendering.
  const { data: staff = [] } = useGetStaffForOrganization(organizationId) as {
    data: StaffBrief[];
  };

  useEffect(() => {
    if (!isLoading && !user) router.replace(routes.login);
  }, [user, isLoading, router]);

  if (isLoading || isServicesLoading) return <Loading />;
  if (!user || !organizationId) return null;

  const isAdmin = user.role === Roles.ADMIN || user.role === Roles.SUPER_ADMIN;

  return (
    <ServicesClient
      services={services}
      staff={staff}
      isAdmin={isAdmin}
      organizationId={organizationId}
    />
  );
}
