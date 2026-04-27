"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as z from "zod";
import { useCreateOrganization } from "@/app/api/hooks/organizations/useCreateOrganization";
import { routes } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/app/api/hooks/auth/useLogin";
import { useLocale } from "@/contexts/locale-context";

const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  industry: z.string().min(1, "Industry is required"),
  email: z.string().email("Invalid email").min(1, "Email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [organizationData, setOrganizationData] =
    useState<CreateOrganizationData>({
      name: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
    });
  const [isPending, setIsPending] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({ ...prev, [name]: value }));
  };

  const { mutateAsync: createOrganization } = useCreateOrganization();
  const { t } = useLocale();

  const handleSubmit = async () => {
    if (isPending) return;

    try {
      createOrganizationSchema.parse(organizationData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors.map((e) => e.message).join(", "));
      }
      return;
    }

    setIsPending(true);
    try {
      await createOrganization(organizationData);
      // Refetch user so organizationId is populated before navigating to dashboard
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(t("organization.created"));
      router.push(routes.dashboard);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("organization.failed")));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">{t("organization.create")}</h3>
        <p className="text-sm text-gray-600">{t("organization.createDesc")}</p>

        <Input
          name="name"
          value={organizationData.name}
          onChange={handleInputChange}
          placeholder={t("organization.name")}
          required
        />
        <Input
          name="industry"
          value={organizationData.industry}
          onChange={handleInputChange}
          placeholder={t("organization.industry")}
          required
        />
        <Input
          name="email"
          value={organizationData.email}
          onChange={handleInputChange}
          placeholder={t("common.email")}
          required
        />
        <Input
          name="phone"
          value={organizationData.phone}
          onChange={handleInputChange}
          placeholder={t("organization.phone")}
        />
        <Input
          name="address"
          value={organizationData.address}
          onChange={handleInputChange}
          placeholder={t("organization.address")}
        />

        <Button
          className="mt-4 w-full"
          onClick={handleSubmit}
          disabled={
            isPending ||
            !organizationData.name ||
            !organizationData.industry ||
            !organizationData.email
          }
        >
          {isPending ? t("organization.creating") : t("organization.create")}
        </Button>
      </div>
    </div>
  );
}
