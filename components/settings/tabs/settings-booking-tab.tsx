"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useUpdateBookingSettings } from "@/app/api/hooks/organizations/useUpdateBookingSettings";
import { useLocale } from "@/contexts/locale-context";

export function SettingsBookingTab({
  organizationId,
  initial,
}: {
  organizationId: string;
  initial: {
    autoConfirmBookings: boolean;
    bufferMinBetweenAppointments: number;
    maxAdvanceDays: number;
    minLeadTimeMin: number;
  };
}) {
  const [autoConfirm, setAutoConfirm] = useState(initial.autoConfirmBookings);
  const [bufferMin, setBufferMin] = useState(String(initial.bufferMinBetweenAppointments));
  const [advanceDays, setAdvanceDays] = useState(initial.maxAdvanceDays);
  const [leadMin, setLeadMin] = useState(initial.minLeadTimeMin);

  const { mutateAsync, isPending } = useUpdateBookingSettings();
  const { t } = useLocale();

  async function handleSave() {
    try {
      await mutateAsync({
        organizationId,
        autoConfirmBookings: autoConfirm,
        bufferMinBetweenAppointments: Number(bufferMin || 0),
        maxAdvanceDays: Number(advanceDays),
        minLeadTimeMin: Number(leadMin),
      });
      toast.success(t("settings.booking.saved"));
    } catch {
      toast.error(t("settings.booking.failed"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.booking.title")}</CardTitle>
        <CardDescription>{t("settings.booking.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("settings.booking.autoConfirm")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("settings.booking.autoConfirmDesc")}
            </p>
          </div>
          <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
        </div>

        <div className="grid gap-2">
          <Label>{t("settings.booking.bufferTime")}</Label>
          <Input
            type="number"
            min={0}
            step={5}
            value={bufferMin}
            onChange={(e) => setBufferMin(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            {t("settings.booking.bufferTimeDesc")}
          </p>
        </div>

        <div className="grid gap-2">
          <Label>{t("settings.booking.advanceBooking")}</Label>
          <Input
            type="number"
            min={1}
            value={advanceDays}
            onChange={(e) => setAdvanceDays(e.target.valueAsNumber)}
          />
          <p className="text-sm text-muted-foreground">
            {t("settings.booking.advanceBookingDesc")}
          </p>
        </div>

        <div className="grid gap-2">
          <Label>{t("settings.booking.leadTime")}</Label>
          <Input
            type="number"
            min={0}
            step={5}
            value={leadMin}
            onChange={(e) => setLeadMin(e.target.valueAsNumber)}
          />
          <p className="text-sm text-muted-foreground">
            {t("settings.booking.leadTimeDesc")}
          </p>
        </div>

        <Separator className="my-4" />
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
