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
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);

  const { mutateAsync, isPending } = useUpdateOrganization();
  const { t } = useLocale();

  async function handleSave() {
    try {
      await mutateAsync({ organizationId, name, email, phone, address });
      toast.success(t("settings.general.saved"));
    } catch {
      toast.error(t("settings.general.failed"));
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t("settings.general.email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{t("settings.general.phone")}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">{t("settings.general.address")}</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </CardContent>
    </Card>
  );
}
