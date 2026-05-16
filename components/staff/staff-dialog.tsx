"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StaffMember } from "@/types/staff";
import { createStaffSchema, updateStaffSchema } from "@/schemas/staff";
import { useLocale } from "@/contexts/locale-context";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  const schema = isEdit ? updateStaffSchema : createStaffSchema;
  const parsed = schema.safeParse({
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone || undefined,
    isActive: values.isActive,
  });
  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      const k = i.path[0] as keyof FormValues | undefined;
      if (k && !errors[k]) errors[k] = i.message;
    }
  }
  return errors;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffMember;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
  }) => Promise<void>;
}

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  onSubmit,
}: StaffDialogProps) {
  const { t } = useLocale();
  const isEdit = !!staff;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [values, setValues] = useState<FormValues>({
    firstName: staff?.firstName ?? "",
    lastName: staff?.lastName ?? "",
    email: staff?.email ?? "",
    phone: staff?.phone ?? "",
    isActive: staff?.isActive ?? true,
  });

  useEffect(() => {
    if (!open) return;
    setValues({
      firstName: staff?.firstName ?? "",
      lastName: staff?.lastName ?? "",
      email: staff?.email ?? "",
      phone: staff?.phone ?? "",
      isActive: staff?.isActive ?? true,
    });
    setErrors({});
  }, [open, staff?.id]);

  function onChange(key: keyof FormValues, value: string | boolean) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values, isEdit);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        isActive: values.isActive,
      });
      onOpenChange(false);
    } catch {
      // error toast handled by parent
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("staff.editTitle") : t("staff.inviteTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("staff.editDesc") : t("staff.inviteDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">{t("staff.firstName")}</Label>
              <Input
                id="firstName"
                value={values.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                placeholder="Jane"
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{t(errors.firstName!)}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">{t("staff.lastName")}</Label>
              <Input
                id="lastName"
                value={values.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{t(errors.lastName!)}</p>
              )}
            </div>
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="email">{t("staff.email")}</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="jane@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{t(errors.email!)}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("staff.inviteHint")}
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="phone">{t("staff.phoneOptional")}</Label>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+385 91 123 4567"
              aria-invalid={!!errors.phone}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{t(errors.phone!)}</p>
            )}
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">{t("staff.activeLabel")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("staff.activeDesc")}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={values.isActive}
                onCheckedChange={(v) => onChange("isActive", v)}
                disabled={loading}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("staff.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("staff.saving")
                : isEdit
                ? t("staff.update")
                : t("staff.sendInvite")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
