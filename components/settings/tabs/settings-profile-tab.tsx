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

type Props = {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
};

export function SettingsProfileTab({ initial }: Props) {
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);

  const { mutateAsync, isPending } = useUpdateMyProfile();
  const { t } = useLocale();

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("settings.profile.nameRequired"));
      return;
    }
    try {
      await mutateAsync({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone || null });
      toast.success(t("settings.profile.saved"));
    } catch {
      toast.error(t("settings.profile.failed"));
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">{t("settings.profile.lastName")}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">{t("settings.profile.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+385 91 234 5678"
          />
        </div>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("settings.profile.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
