"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import Loading from "@/components/ui/loading";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(routes.tickets);
  }, [router]);

  return <Loading />;
}
