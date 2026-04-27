"use client";
import { useLogout } from "@/app/api/hooks/auth/useLogOut";
import { DashboardHeaderClient } from "./dashboard-header-client";

export function DashboardHeader({
  userName,
  tenantName,
}: {
  userName: string;
  tenantName: string;
}) {
  const { mutate: logout } = useLogout();

  return (
    <DashboardHeaderClient
      userName={userName}
      tenantName={tenantName}
      onSignOut={logout}
    />
  );
}
