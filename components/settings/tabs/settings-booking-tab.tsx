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
import { BookingSettingsSchema, type BookingSettingsInput } from "@/schemas/tennant-settings";
import { parseApiError } from "@/lib/api-errors";

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
  const [errors, setErrors] = useState<Partial<Record<keyof BookingSettingsInput, string>>>({});

  const { mutateAsync, isPending } = useUpdateBookingSettings();
  const { t } = useLocale();

  async function handleSave() {
    const candidate: BookingSettingsInput = {
      autoConfirmBookings: autoConfirm,
      bufferMinBetweenAppointments: Number(bufferMin || 0),
      maxAdvanceDays: Number(advanceDays),
      minLeadTimeMin: Number(leadMin),
    };
    const parsed = BookingSettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      const errs: Partial<Record<keyof BookingSettingsInput, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof BookingSettingsInput | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await mutateAsync({ organizationId, ...parsed.data });
      toast.success(t("settings.booking.saved"));
    } catch (err) {
      const e = parseApiError(err, t("settings.booking.failed"));
      setErrors((s) => ({ ...s, ...e.fieldErrors }));
      toast.error(e.message);
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
            max={30}
            step={5}
            value={bufferMin}
            onChange={(e) => setBufferMin(e.target.value)}
            aria-invalid={!!errors.bufferMinBetweenAppointments}
          />
          {errors.bufferMinBetweenAppointments ? (
            <p className="text-xs text-destructive">{t(errors.bufferMinBetweenAppointments!)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("settings.booking.bufferTimeDesc")}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label>{t("settings.booking.advanceBooking")}</Label>
          <Input
            type="number"
            min={7}
            max={120}
            value={advanceDays}
            onChange={(e) => setAdvanceDays(e.target.valueAsNumber)}
            aria-invalid={!!errors.maxAdvanceDays}
          />
          {errors.maxAdvanceDays ? (
            <p className="text-xs text-destructive">{t(errors.maxAdvanceDays!)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("settings.booking.advanceBookingDesc")}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label>{t("settings.booking.leadTime")}</Label>
          <Input
            type="number"
            min={0}
            max={1440}
            step={5}
            value={leadMin}
            onChange={(e) => setLeadMin(e.target.valueAsNumber)}
            aria-invalid={!!errors.minLeadTimeMin}
          />
          {errors.minLeadTimeMin ? (
            <p className="text-xs text-destructive">{t(errors.minLeadTimeMin!)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("settings.booking.leadTimeDesc")}</p>
          )}
        </div>

        <Separator className="my-4" />
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
