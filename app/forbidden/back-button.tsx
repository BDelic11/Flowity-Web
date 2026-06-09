"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

export function BackButton() {
  const router = useRouter();
  const { t } = useLocale();
  return (
    <Button variant="secondary" onClick={() => router.back()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t("errors.goBack")}
    </Button>
  );
}
