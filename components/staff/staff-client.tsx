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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { StaffDialog } from "@/components/staff/staff-dialog";
import { useCreateStaff } from "@/app/api/hooks/staff/useCreateStaff";
import { useUpdateStaff } from "@/app/api/hooks/staff/useUpdateStaff";
import { useDeleteStaff } from "@/app/api/hooks/staff/useDeleteStaff";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { toast } from "sonner";
import { StaffMember } from "@/types/staff";
import PageLayout from "../ui/page-layout";
import { EmptyState, StaffIllustration } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/app/api/hooks/auth/useLogin";
import { useLocale } from "@/contexts/locale-context";

export default function StaffClient({
  staff,
  isAdmin,
  organizationId,
}: {
  staff: StaffMember[];
  isAdmin: boolean;
  organizationId: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<StaffMember | undefined>();
  const { askDelete, ConfirmPortal } = useDeleteConfirm();
  const { t } = useLocale();

  const { mutateAsync: createStaff } = useCreateStaff();
  const { mutateAsync: updateStaff } = useUpdateStaff();
  const { mutateAsync: deleteStaff } = useDeleteStaff();

  function handleAddNew() {
    setSelected(undefined);
    setDialogOpen(true);
  }

  function handleEdit(member: StaffMember) {
    setSelected(member);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    const ok = await askDelete({
      name,
      description: t("staff.removeConfirmDesc"),
      confirmLabel: t("staff.remove"),
    });
    if (!ok) return;
    try {
      await deleteStaff(id);
      toast.success(t("staff.removed"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("staff.deleteFailed")));
    }
  }

  async function handleSubmit(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive: boolean;
  }) {
    try {
      if (selected) {
        await updateStaff({
          id: selected.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone || null,
          isActive: payload.isActive,
        });
        toast.success(t("staff.updated"));
      } else {
        await createStaff({
          organizationId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone || undefined,
        });
        toast.success(t("staff.invited"));
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("staff.saveFailed")));
    }
  }

  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight pb-2">
            {t("staff.title")}
          </h2>
          <p className="text-muted-foreground">{t("staff.description")}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("staff.addStaff")}
          </Button>
        )}
      </div>

      {staff.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <Card key={member.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {member.firstName?.[0]?.toUpperCase() ?? "?"}
                      {member.lastName?.[0]?.toUpperCase() ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription>
                      {member.isActive ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {t("services.active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t("services.inactive")}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{member.phone || "—"}</span>
                </div>

                {isAdmin && (
                  <div className="pt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 bg-transparent"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                      {t("services.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                      onClick={() => handleDelete(member.id, member.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("staff.remove")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          illustration={<StaffIllustration />}
          title={t("staff.emptyTitle")}
          description={t("staff.emptyDesc")}
          action={
            isAdmin ? (
              <Button onClick={handleAddNew} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("staff.addStaff")}
              </Button>
            ) : null
          }
        />
      )}

      {ConfirmPortal}

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={selected}
        onSubmit={handleSubmit}
      />
    </PageLayout>
  );
}
