"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateMyProfile } from "@/app/api/hooks/users/useUpdateMyProfile";
import { useUpdateBookableMode } from "@/app/api/hooks/users/useUpdateBookableMode";
import { useGetServices } from "@/app/api/hooks/services/useGetServices";
import { useLocale } from "@/contexts/locale-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageLayout from "@/components/ui/page-layout";
import Loading from "@/components/ui/loading";
import { toast } from "sonner";
import { Roles } from "@/constants/roles";
import { Scissors } from "lucide-react";
import { z } from "zod";
import { personNameField, optionalPhoneField } from "@/schemas/_shared";

const profileSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  phone: optionalPhoneField,
});

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { t } = useLocale();
  const { mutateAsync: updateProfile, isPending: profilePending } = useUpdateMyProfile();
  const { mutateAsync: updateBookable, isPending: bookablePending } = useUpdateBookableMode();
  const { data: services, isLoading: servicesLoading } = useGetServices(
    user?.organizationId ?? null,
  );

  const nameParts = (user?.name ?? "").split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = user?.role === Roles.ADMIN || user?.role === Roles.SUPER_ADMIN;

  const [bookable, setBookable] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [bookableError, setBookableError] = useState<string | null>(null);

  // Hydrate from server once auth loads. Subsequent edits stay local until save.
  useEffect(() => {
    if (!user) return;
    setBookable(user.isBookable);
    setSelectedServices(new Set(user.bookableServiceIds));
  }, [user?.id, user?.isBookable, user?.bookableServiceIds.length]);

  const orderedServices = useMemo(
    () => (services ?? []).filter((s) => s.isActive),
    [services],
  );

  if (isLoading) return <Loading />;
  if (!user) return null;

  async function handleSaveProfile() {
    const parsed = profileSchema.safeParse({
      firstName,
      lastName,
      phone: phone || undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as string;
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || null,
      });
      toast.success(t("settings.profile.saved"));
    } catch {
      toast.error(t("settings.profile.failed"));
    }
  }

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBookableError(null);
  }

  async function handleSaveBookable() {
    if (bookable && selectedServices.size === 0) {
      setBookableError(t("profile.bookable.pickAtLeastOne"));
      return;
    }
    setBookableError(null);
    try {
      await updateBookable({
        enabled: bookable,
        serviceIds: Array.from(selectedServices),
      });
      toast.success(t("profile.bookable.saved"));
    } catch {
      toast.error(t("profile.bookable.failed"));
    }
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.profile.title")}</h2>
        <p className="text-muted-foreground">{t("settings.profile.description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("settings.profile.title")}</CardTitle>
            <CardDescription>{t("settings.profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("settings.profile.email")}</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t("settings.profile.emailReadOnly")}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">{t("settings.profile.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={!!fieldErrors.firstName}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive">{t(fieldErrors.firstName)}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t("settings.profile.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive">{t(fieldErrors.lastName)}</p>
                )}
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
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && (
                <p className="text-xs text-destructive">{t(fieldErrors.phone)}</p>
              )}
            </div>

            <Button onClick={handleSaveProfile} disabled={profilePending}>
              {profilePending ? t("common.saving") : t("settings.profile.save")}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t("settings.profile.email")}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("profile.role")}</span>
                <span className="font-medium">
                  {bookable && isAdmin
                    ? t("profile.roleAdminWorker")
                    : isAdmin
                    ? t("profile.roleAdmin")
                    : t("profile.roleWorker")}
                </span>
              </div>
              {user.organizationId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("profile.organization")}</span>
                  <span className="font-medium truncate max-w-[180px]">{user.tenantName || "—"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin-only: "I also serve clients" toggle + service picker */}
        {isAdmin && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{t("profile.bookable.title")}</CardTitle>
                    <CardDescription>{t("profile.bookable.description")}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={bookable}
                  onCheckedChange={(v) => {
                    setBookable(v);
                    setBookableError(null);
                  }}
                  aria-label={t("profile.bookable.toggleLabel")}
                />
              </div>
            </CardHeader>

            {bookable && (
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{t("profile.bookable.servicesTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.bookable.servicesDesc")}
                  </p>
                </div>

                {servicesLoading ? (
                  <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                ) : orderedServices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("profile.bookable.noServices")}
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {orderedServices.map((svc) => {
                      const checked = selectedServices.has(svc.id!);
                      return (
                        <label
                          key={svc.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary"
                        >
                          <Checkbox
                            checked={checked}
                            onChange={() => toggleService(svc.id!)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{svc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {svc.durationMin} {t("services.min")}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {bookableError && (
                  <p className="text-sm text-destructive">{bookableError}</p>
                )}
              </CardContent>
            )}

            <CardContent>
              <Button onClick={handleSaveBookable} disabled={bookablePending}>
                {bookablePending ? t("common.saving") : t("profile.bookable.save")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
