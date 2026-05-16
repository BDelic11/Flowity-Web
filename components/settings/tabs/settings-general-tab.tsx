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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUpdateOrganization } from "@/app/api/hooks/organizations/useUpdateOrganization";
import { useLocale } from "@/contexts/locale-context";
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/schemas/organization";
import { parseApiError } from "@/lib/api-errors";

export function SettingsGeneralTab({
  organizationId,
  initial,
}: {
  organizationId: string;
  initial: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}) {
  const [values, setValues] = useState<UpdateOrganizationInput>({
    name: initial.name,
    email: initial.email,
    phone: initial.phone,
    address: initial.address,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateOrganizationInput, string>>>({});

  const { mutateAsync, isPending } = useUpdateOrganization();
  const { t } = useLocale();

  function onChange<K extends keyof UpdateOrganizationInput>(key: K, v: UpdateOrganizationInput[K]) {
    setErrors((s) => ({ ...s, [key]: undefined }));
    setValues((s) => ({ ...s, [key]: v }));
  }

  async function handleSave() {
    const parsed = updateOrganizationSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof UpdateOrganizationInput, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof UpdateOrganizationInput | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    try {
      await mutateAsync({ organizationId, ...parsed.data });
      toast.success(t("settings.general.saved"));
    } catch (err) {
      const e = parseApiError(err, t("settings.general.failed"));
      setErrors((s) => ({ ...s, ...e.fieldErrors }));
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.general.title")}</CardTitle>
        <CardDescription>{t("settings.general.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="salon-name">{t("settings.general.salonName")}</Label>
          <Input
            id="salon-name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-destructive">{t(errors.name!)}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t("settings.general.email")}</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{t(errors.email!)}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{t("settings.general.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-destructive">{t(errors.phone!)}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">{t("settings.general.address")}</Label>
          <Input
            id="address"
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            aria-invalid={!!errors.address}
          />
          {errors.address && <p className="text-xs text-destructive">{t(errors.address!)}</p>}
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
