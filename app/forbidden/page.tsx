"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { BackButton } from "./back-button";
import { useLocale } from "@/contexts/locale-context";

export default function ForbiddenPage() {
  const { t } = useLocale();

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-muted">
          <Lock className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{t("errors.forbidden.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("errors.forbidden.description")}
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BackButton />

          <Button asChild>
            <Link href="/dashboard">{t("errors.toDashboard")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
