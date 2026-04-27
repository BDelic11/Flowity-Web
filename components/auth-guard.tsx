import type React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { routes } from "@/constants/routes";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.login);
  }

  return <>{children}</>;
}
