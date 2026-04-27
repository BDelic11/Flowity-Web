"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Loading from "@/components/ui/loading";
import { routes } from "@/constants/routes";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(routes.dashboard);
    } else {
      router.replace(routes.login);
    }
  }, [user, isLoading, router]);

  return <Loading />;
}
