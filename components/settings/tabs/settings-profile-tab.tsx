"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateMyProfile } from "@/app/api/hooks/users/useUpdateMyProfile";
import { useLocale } from "@/contexts/locale-context";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile";
import { parseApiError } from "@/lib/api-errors";

type Props = {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
};

export function SettingsProfileTab({ initial }: Props) {
  const [values, setValues] = useState<UpdateProfileInput>({
    firstName: initial.firstName,
    lastName: initial.lastName,
    phone: initial.phone || undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfileInput, string>>>({});

  const { mutateAsync, isPending } = useUpdateMyProfile();
  const { t } = useLocale();

  function onChange<K extends keyof UpdateProfileInput>(key: K, v: UpdateProfileInput[K]) {
    setErrors((s) => ({ ...s, [key]: undefined }));
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function handleSave() {
    const parsed = updateProfileSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof UpdateProfileInput, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof UpdateProfileInput | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    try {
      await mutateAsync({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone ?? null,
      });
      toast.success(t("settings.profile.saved"));
    } catch (err) {
      const e = parseApiError(err, t("settings.profile.failed"));
      setErrors((s) => ({ ...s, ...e.fieldErrors }));
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.profile.title")}</CardTitle>
        <CardDescription>{t("settings.profile.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("settings.profile.email")}</Label>
          <Input id="email" value={initial.email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">{t("settings.profile.emailReadOnly")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">{t("settings.profile.firstName")}</Label>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && <p className="text-xs text-destructive">{t(errors.firstName!)}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">{t("settings.profile.lastName")}</Label>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && <p className="text-xs text-destructive">{t(errors.lastName!)}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">{t("settings.profile.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+385 91 234 5678"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-destructive">{t(errors.phone!)}</p>}
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("settings.profile.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
