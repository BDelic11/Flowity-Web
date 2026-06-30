"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BusinessHourRow } from "@/types/organization";
import { useUpdateBusinessHours } from "@/app/api/hooks/organizations/useUpdateBusinessHours";
import { useLocale } from "@/contexts/locale-context";

const WEEKDAY_NAMES = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
]);

function isWeekday(day: string) {
  return WEEKDAY_NAMES.has(day.toLowerCase());
}

function isMonday(day: string) {
  return day.toLowerCase() === "monday";
}

export function SettingsBusinessTab({
  organizationId,
  initialHours,
}: {
  organizationId: string;
  initialHours: BusinessHourRow[];
}) {
  const [rows, setRows] = useState<BusinessHourRow[]>(initialHours);
  const [syncWeekdays, setSyncWeekdays] = useState(false);

  const { mutateAsync, isPending } = useUpdateBusinessHours();
  const { t } = useLocale();

  // When sync is on, propagate Monday's values to every other weekday on every render —
  // keeps the inputs in lockstep with whatever the admin types into Monday.
  useEffect(() => {
    if (!syncWeekdays) return;
    const monday = rows.find((r) => isMonday(r.day));
    if (!monday) return;

    const needsUpdate = rows.some(
      (r) =>
        isWeekday(r.day) &&
        !isMonday(r.day) &&
        (r.enabled !== monday.enabled || r.open !== monday.open || r.close !== monday.close),
    );
    if (!needsUpdate) return;

    setRows((prev) =>
      prev.map((r) =>
        isWeekday(r.day) && !isMonday(r.day)
          ? { ...r, enabled: monday.enabled, open: monday.open, close: monday.close }
          : r,
      ),
    );
  }, [syncWeekdays, rows]);

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
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="pr-4">
            <Label htmlFor="sync-weekdays" className="text-sm font-medium">
              {t("settings.business.syncWeekdays")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("settings.business.syncWeekdaysDesc")}
            </p>
          </div>
          <Switch
            id="sync-weekdays"
            checked={syncWeekdays}
            onCheckedChange={setSyncWeekdays}
          />
        </div>

        {rows.map((row, i) => {
          const mirrored = syncWeekdays && isWeekday(row.day) && !isMonday(row.day);
          return (
            <div
              key={row.day}
              className="flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pb-0"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Switch
                  checked={row.enabled}
                  onCheckedChange={(v) => update(i, { enabled: v })}
                  disabled={mirrored}
                />
                <span className="font-medium sm:w-28">
                  {row.day}
                  {mirrored && (
                    <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-primary">
                      {t("settings.business.synced")}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="time"
                  value={row.open}
                  onChange={(e) => update(i, { open: e.target.value })}
                  className="w-[calc(50%-1.25rem)] min-w-[100px] sm:w-32"
                  disabled={!row.enabled || mirrored}
                />
                <span className="text-muted-foreground">{t("settings.business.to")}</span>
                <Input
                  type="time"
                  value={row.close}
                  onChange={(e) => update(i, { close: e.target.value })}
                  className="w-[calc(50%-1.25rem)] min-w-[100px] sm:w-32"
                  disabled={!row.enabled || mirrored}
                />
              </div>
            </div>
          );
        })}

        <Separator className="my-4" />
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
