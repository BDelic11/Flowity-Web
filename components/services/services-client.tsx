"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Clock,
  Edit,
  Trash2,
  EuroIcon,
  Users,
  Package,
} from "lucide-react";
import { ServiceDialog } from "@/components/services/service-dialog";
import { ServiceProductsDialog } from "@/components/services/service-products-dialog";
import { useCreateService } from "@/app/api/hooks/services/useCreateService";
import { useUpdateService } from "@/app/api/hooks/services/useUpdateService";
import { useDeleteService } from "@/app/api/hooks/services/useDeleteService";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import PageLayout from "../ui/page-layout";
import { EmptyState, ServicesIllustration } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { ServiceData } from "@/types/service";
import { useLocale } from "@/contexts/locale-context";

type StaffBrief = { id: string; name: string };

export default function ServicesClient({
  services,
  staff,
  isAdmin,
  organizationId,
}: {
  services: ServiceData[];
  staff: StaffBrief[];
  isAdmin: boolean;
  organizationId: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceData | undefined>();
  const [productsDialogOpen, setProductsDialogOpen] = useState(false);
  const [productsService, setProductsService] = useState<
    ServiceData | undefined
  >();
  const { askDelete, ConfirmPortal } = useDeleteConfirm();
  const { t } = useLocale();

  const { mutateAsync: createServiceMutation } = useCreateService();
  const { mutateAsync: updateServiceMutation } = useUpdateService();
  const { mutateAsync: deleteServiceMutation } = useDeleteService();

  function handleAddNew() {
    setSelected(undefined);
    setDialogOpen(true);
  }

  function handleEdit(item: ServiceData) {
    setSelected(item);
    setDialogOpen(true);
  }

  function handleProducts(item: ServiceData) {
    setProductsService(item);
    setProductsDialogOpen(true);
  }

  async function handleDelete(serviceId: string) {
    const ok = await askDelete({
      title: t("services.deleteConfirmTitle"),
      description: t("services.deleteConfirmDesc"),
      confirmLabel: t("services.delete"),
    });
    if (!ok) return;

    try {
      await deleteServiceMutation(serviceId);
      toast.success(t("services.deleted"));
    } catch {
      toast.error(t("services.deleteFailed"));
    }
  }

  async function handleSubmit(payload: ServiceData) {
    try {
      if (payload.id) {
        await updateServiceMutation({
          id: payload.id,
          name: payload.name,
          description: payload.description ?? null,
          durationMin: payload.durationMin,
          bufferBeforeMin: payload.bufferBeforeMin ?? 0,
          bufferAfterMin: payload.bufferAfterMin ?? 0,
          priceMin: payload.priceMin ?? null,
          priceMax: payload.priceMax ?? payload.priceMin ?? null,
          isActive: payload.isActive ?? true,
          color: payload.color,
          workerIds: payload.workerIds ?? [],
        });
        toast.success(t("services.updated"));
      } else {
        await createServiceMutation({
          organizationId,
          name: payload.name,
          description: payload.description ?? null,
          durationMin: payload.durationMin,
          bufferBeforeMin: payload.bufferBeforeMin ?? 0,
          bufferAfterMin: payload.bufferAfterMin ?? 0,
          priceMin: payload.priceMin ?? null,
          priceMax: payload.priceMax ?? payload.priceMin ?? null,
          color: payload.color,
          workerIds: payload.workerIds ?? [],
        });
        toast.success(t("services.created"));
      }
      setDialogOpen(false);
    } catch {
      toast.error(t("services.saveFailed"));
    }
  }

  return (
    <PageLayout>
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight pb-2">
              {t("services.title")}
            </h2>
            <p className="text-muted-foreground">{t("services.description")}</p>
          </div>
          {isAdmin && (
            <Button onClick={handleAddNew} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("services.addService")}</span>
            </Button>
          )}
        </div>

        {services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary" className="mt-1">
                          {service.isActive
                            ? t("services.active")
                            : t("services.inactive")}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div
                      className="h-3 w-3 rounded-full mt-1"
                      style={{ backgroundColor: service.color ?? "#3b82f6" }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {service.durationMin} {t("services.min")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <EuroIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {service.priceMin != null
                          ? `${service.priceMin}`
                          : t("common.free")}
                      </span>
                    </div>
                    {service.workerIds && service.workerIds.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground text-xs">
                          {service.workerIds
                            .map((id) => staff.find((s) => s.id === id)?.name)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                    {service.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 bg-transparent"
                        onClick={() => handleProducts(service)}
                      >
                        <Package className="h-4 w-4" />
                        Materijali
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                        {t("services.edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("services.delete")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            illustration={<ServicesIllustration />}
            title={t("services.emptyTitle")}
            description={t("services.emptyDesc")}
            action={
              isAdmin ? (
                <Button onClick={handleAddNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("services.createFirst")}
                </Button>
              ) : null
            }
          />
        )}
      </div>

      {ConfirmPortal}

      {productsService && (
        <ServiceProductsDialog
          open={productsDialogOpen}
          onOpenChange={setProductsDialogOpen}
          serviceId={productsService.id}
          serviceName={productsService.name}
          organizationId={organizationId}
        />
      )}

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selected}
        onSubmit={handleSubmit}
        staffList={staff}
        isAdmin={isAdmin}
      />
    </PageLayout>
  );
}
