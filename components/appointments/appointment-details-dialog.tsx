"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, User, Tag, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import type { Appointment } from "@/lib/types";
import type { CalendarStaff } from "@/types/calendar";
import { useLocale } from "@/contexts/locale-context";

// Convert ISO string to datetime-local input value (local time)
function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Convert datetime-local value back to ISO UTC string
function localToISO(local: string): string {
  return new Date(local).toISOString();
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  staff: CalendarStaff[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (data: {
    bookingId: string;
    clientName: string;
    startAt: string;
    endAt: string;
    workerId?: string | null;
    notes?: string | null;
  }) => Promise<void>;
}

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  staff,
  onDelete,
  onUpdate,
}: AppointmentDetailsDialogProps) {
  const { t } = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [clientName, setClientName] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [workerId, setWorkerId] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Reset form when appointment changes or dialog opens
  useEffect(() => {
    if (appointment) {
      setClientName(appointment.clientName);
      setStartLocal(isoToLocal(appointment.start));
      setEndLocal(isoToLocal(appointment.end));
      setWorkerId(appointment.staffId ?? "");
      setNotes(appointment.notes ?? "");
    }
    setIsEditing(false);
  }, [appointment, open]);

  if (!appointment) return null;

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(appointment!.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({
        bookingId: appointment!.id,
        clientName,
        startAt: localToISO(startLocal),
        endAt: localToISO(endLocal),
        workerId: workerId || null,
        notes: notes || null,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: appointment.color }}
            />
            {isEditing ? t("appointments.edit") : t("appointments.details")}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          /* ── EDIT MODE ─────────────────────────────────────────── */
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t("appointments.client")}</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("appointments.start")}</Label>
                <Input
                  type="datetime-local"
                  value={startLocal}
                  onChange={(e) => setStartLocal(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("appointments.end")}</Label>
                <Input
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
                />
              </div>
            </div>

            {staff.length > 0 && (
              <div className="space-y-1.5">
                <Label>{t("appointments.staff")}</Label>
                <Select value={workerId} onValueChange={setWorkerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff…" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>{t("appointments.notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes…"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="mr-1.5 h-4 w-4" />
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !clientName.trim()}>
                {isSaving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ─────────────────────────────────────────── */
          <>
            <div className="space-y-3 py-2">
              <Row icon={<User className="h-4 w-4" />} label={t("appointments.client")}>
                {appointment.clientName}
              </Row>
              <Row icon={<Tag className="h-4 w-4" />} label={t("appointments.service")}>
                {appointment.serviceName}
              </Row>
              <Row icon={<Clock className="h-4 w-4" />} label={t("appointments.time")}>
                {appointment.startTime} – {appointment.endTime}
              </Row>
              <Row icon={<Calendar className="h-4 w-4" />} label={t("appointments.status")}>
                <Badge variant="secondary">
                  {appointment.status ?? t("appointments.statusScheduled")}
                </Badge>
              </Row>
              {appointment.notes && (
                <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {appointment.notes}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 h-4 w-4" />
                )}
                {t("common.delete")}
              </Button>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1.5 h-4 w-4" />
                {t("common.edit")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
