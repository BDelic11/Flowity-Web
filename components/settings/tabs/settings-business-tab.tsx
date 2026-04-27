"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BusinessHourRow } from "@/types/organization";
import { useUpdateBusinessHours } from "@/app/api/hooks/organizations/useUpdateBusinessHours";
import { useLocale } from "@/contexts/locale-context";

export function SettingsBusinessTab({
  organizationId,
  initialHours,
}: {
  organizationId: string;
  initialHours: BusinessHourRow[];
}) {
  const [rows, setRows] = useState<BusinessHourRow[]>(initialHours);

  const { mutateAsync, isPending } = useUpdateBusinessHours();
  const { t } = useLocale();

  function update(i: number, patch: Partial<BusinessHourRow>) {
    setRows((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function handleSave() {
    try {
      await mutateAsync({ organizationId, businessHours: rows });
      toast.success(t("settings.business.saved"));
    } catch {
      toast.error(t("settings.business.failed"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.business.title")}</CardTitle>
        <CardDescription>{t("settings.business.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row, i) => (
          <div key={row.day} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Switch
                checked={row.enabled}
                onCheckedChange={(v) => update(i, { enabled: v })}
              />
              <span className="w-28 font-medium">{row.day}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={row.open}
                onChange={(e) => update(i, { open: e.target.value })}
                className="w-32"
                disabled={!row.enabled}
              />
              <span className="text-muted-foreground">{t("settings.business.to")}</span>
              <Input
                type="time"
                value={row.close}
                onChange={(e) => update(i, { close: e.target.value })}
                className="w-32"
                disabled={!row.enabled}
              />
            </div>
          </div>
        ))}
        <Separator className="my-4" />
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
