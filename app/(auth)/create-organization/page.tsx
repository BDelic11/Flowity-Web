"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateOrganization } from "@/app/api/hooks/organizations/useCreateOrganization";
import { routes } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/schemas/organization";
import { parseApiError } from "@/lib/api-errors";
import { useLocale } from "@/contexts/locale-context";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CreateOrganizationInput>({
    name: "",
    industry: "",
    email: "",
    phone: "",
    address: "",
    timeZone:
      typeof window !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "Europe/Zagreb",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateOrganizationInput, string>>>({});
  const [isPending, setIsPending] = useState(false);

  function onChange<K extends keyof CreateOrganizationInput>(
    key: K,
    v: CreateOrganizationInput[K]
  ) {
    setErrors((s) => ({ ...s, [key]: undefined }));
    setValues((s) => ({ ...s, [key]: v }));
  }

  const { mutateAsync: createOrganization } = useCreateOrganization();
  const { t } = useLocale();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;

    const parsed = createOrganizationSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof CreateOrganizationInput, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof CreateOrganizationInput | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }

    setIsPending(true);
    try {
      await createOrganization(parsed.data);
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(t("organization.created"));
      router.push(routes.dashboard);
    } catch (error) {
      const err = parseApiError(error, t("organization.failed"));
      setErrors((s) => ({ ...s, ...err.fieldErrors }));
      toast.error(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">{t("organization.create")}</h3>
        <p className="text-sm text-gray-600">{t("organization.createDesc")}</p>

        <div>
          <Input
            name="name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder={t("organization.name")}
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{t(errors.name!)}</p>}
        </div>

        <div>
          <Input
            name="industry"
            value={values.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            placeholder={t("organization.industry")}
            aria-invalid={!!errors.industry}
            required
          />
          {errors.industry && <p className="text-xs text-destructive mt-1">{t(errors.industry!)}</p>}
        </div>

        <div>
          <Input
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={t("common.email")}
            autoComplete="email"
            aria-invalid={!!errors.email}
            required
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{t(errors.email!)}</p>}
        </div>

        <div>
          <Input
            name="phone"
            value={values.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t("organization.phone")}
            inputMode="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{t(errors.phone!)}</p>}
        </div>

        <div>
          <Input
            name="address"
            value={values.address ?? ""}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder={t("organization.address")}
            aria-invalid={!!errors.address}
          />
          {errors.address && <p className="text-xs text-destructive mt-1">{t(errors.address!)}</p>}
        </div>

        <Button type="submit" className="mt-4 w-full" disabled={isPending}>
          {isPending ? t("organization.creating") : t("organization.create")}
        </Button>
      </form>
    </div>
  );
}
