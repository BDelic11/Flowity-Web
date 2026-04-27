"use client";

import * as React from "react";
import { Formik, Form, Field } from "formik";
import { z } from "zod";
import { addMinutes, format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StaffOption, ServiceOption } from "@/types/calendar";
import { useMemo } from "react";
import { useLocale } from "@/contexts/locale-context";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const AppointmentZ = z.object({
  clientName: z.string().trim().min(2, "Too short").max(120, "Too long"),
  staffId: z.string().min(1, "Required"),
  serviceId: z.string().min(1, "Required"),
  date: z.string().regex(dateRegex, "Invalid date"),
  time: z.string().regex(timeRegex, "Invalid time"),
  notes: z.string().max(1000, "Too long").optional(),
});
type FormValues = z.infer<typeof AppointmentZ>;

function zodToFormikErrors<T>(result: z.SafeParseReturnType<T, any>) {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffOptions: StaffOption[];
  services: ServiceOption[];
  initialDateISO?: string;
  initialStaffId?: string;
  appointment?: {
    id: string;
    clientName: string;
    staffId: string;
    serviceId: string;
    startISO: string;
    notes?: string | null;
  };
  onSubmit: (payload: {
    clientName: string;
    staffId: string;
    serviceId: string;
    startISO: string;
    endISO: string;
    notes?: string | null;
  }) => Promise<void>;

  /** Working day bounds in 24h; defaults match your grid */
  workingStartHour?: number; // e.g. 9
  workingEndHour?: number; // e.g. 18 (end of day)
};

export function AppointmentDialog({
  open,
  onOpenChange,
  staffOptions,
  services,
  initialDateISO,
  initialStaffId,
  appointment,
  onSubmit,
  workingStartHour = 9,
  workingEndHour = 18,
}: Props) {
  const { t } = useLocale();
  const init = useMemo<FormValues>(() => {
    const d = appointment
      ? new Date(appointment.startISO)
      : initialDateISO
      ? new Date(initialDateISO)
      : new Date();

    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return {
      date: format(local, "yyyy-MM-dd"),
      time: format(local, "HH:mm"),
      staffId: appointment?.staffId ?? initialStaffId ?? "",
      serviceId: appointment?.serviceId ?? "",
      clientName: appointment?.clientName ?? "",
      notes: appointment?.notes ?? "",
    };
  }, [appointment, initialDateISO, initialStaffId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {appointment ? t("appointments.editTitle") : t("appointments.newTitle")}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? t("appointments.editDesc")
              : t("appointments.newDesc")}
          </DialogDescription>
        </DialogHeader>

        <Formik<FormValues>
          initialValues={init}
          validate={(values) => {
            const errs = zodToFormikErrors(AppointmentZ.safeParse(values));

            // If the selected staff is not allowed for the selected service, clear the error
            // and let the filtered dropdown handle it naturally (staffId becomes invalid)
            const selectedSvc = services.find((s) => s.id === values.serviceId);
            if (selectedSvc && selectedSvc.workerIds.length > 0 && values.staffId) {
              if (!selectedSvc.workerIds.includes(values.staffId)) {
                errs.staffId = "This staff member doesn't perform the selected service.";
              }
            }

            // Compose start as LOCAL time (no TZ offset here)
            const startLocal = new Date(`${values.date}T${values.time}:00`);
            if (isNaN(startLocal.getTime())) {
              errs.time ??= "Invalid date/time.";
              return errs;
            }

            // --- rule 1: not in the past (only for create; remove guard to also enforce on edit) ---
            if (!appointment) {
              const now = new Date();
              if (startLocal.getTime() < now.getTime() - 5000) {
                errs.time ??= "Start time can’t be in the past.";
              }
            }

            // --- rule 2: inside working day (respect service duration) ---
            const svc = services.find((s) => s.id === values.serviceId);
            const duration = svc?.duration ?? 30; // minutes
            const startMinutes =
              startLocal.getHours() * 60 + startLocal.getMinutes();
            const endMinutes = startMinutes + duration;

            const dayStart = workingStartHour * 60;
            const dayEnd = workingEndHour * 60; // exclusive upper bound

            if (startMinutes < dayStart) {
              errs.time ??= `Opens at ${String(workingStartHour).padStart(
                2,
                "0"
              )}:00.`;
            } else if (endMinutes > dayEnd) {
              // pick which message you prefer:
              const hh = String(workingEndHour).padStart(2, "0");
              errs.time ??= `Service must end by ${hh}:00.`;
            }

            return errs;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // Keep as local wall-clock time — no UTC conversion.
              // The backend stores TIMESTAMP WITHOUT TIME ZONE, so we send a bare local ISO string.
              const startLocal = new Date(`${values.date}T${values.time}:00`);
              const svc = services.find((s) => s.id === values.serviceId);
              const endLocal = addMinutes(startLocal, svc?.duration ?? 30);
              const toLocalISO = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm:ss");

              await onSubmit({
                clientName: values.clientName.trim(),
                staffId: values.staffId,
                serviceId: values.serviceId,
                startISO: toLocalISO(startLocal),
                endISO: toLocalISO(endLocal),
                notes: values.notes?.trim() || undefined,
              });
              onOpenChange(false);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => {
            // Compute which staff can perform the currently selected service
            const selectedSvc = services.find((s) => s.id === values.serviceId);
            const availableStaff =
              selectedSvc && selectedSvc.workerIds.length > 0
                ? staffOptions.filter((s) => selectedSvc.workerIds.includes(s.id))
                : staffOptions;

            return (
            <Form>
              <div className="grid gap-4 py-2">
                {/* Client */}
                <div className="grid gap-2">
                  <Label htmlFor="clientName">{t("appointments.clientName")}</Label>
                  <Field
                    as={Input}
                    id="clientName"
                    name="clientName"
                    placeholder={t("appointments.clientNamePlaceholder")}
                  />
                  {touched.clientName && errors.clientName && (
                    <p className="text-xs text-destructive">
                      {errors.clientName}
                    </p>
                  )}
                </div>

                {/* Service — pick service FIRST so staff list filters */}
                <div className="grid gap-2">
                  <Label>{t("appointments.service")}</Label>
                  <Select
                    value={values.serviceId}
                    onValueChange={(v) => {
                      setFieldValue("serviceId", v);
                      // Clear staff if the current selection isn't valid for new service
                      const svc = services.find((s) => s.id === v);
                      if (svc && svc.workerIds.length > 0 && !svc.workerIds.includes(values.staffId)) {
                        setFieldValue("staffId", "");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("appointments.selectService")} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — €{s.price} ({s.duration}m)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.serviceId && errors.serviceId && (
                    <p className="text-xs text-destructive">
                      {errors.serviceId}
                    </p>
                  )}
                </div>

                {/* Staff — filtered to workers assigned to selected service */}
                <div className="grid gap-2">
                  <Label>{t("appointments.staffMember")}</Label>
                  <Select
                    value={values.staffId}
                    onValueChange={(v) => setFieldValue("staffId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("appointments.selectStaff")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStaff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.staffId && errors.staffId && (
                    <p className="text-xs text-destructive">{errors.staffId}</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="date">{t("appointments.date")}</Label>
                    <Field as={Input} id="date" name="date" type="date" />
                    {touched.date && errors.date && (
                      <p className="text-xs text-destructive">{errors.date}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">{t("appointments.startTime")}</Label>
                    <Field as={Input} id="time" name="time" type="time" />
                    {touched.time && errors.time && (
                      <p className="text-xs text-destructive">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">{t("appointments.notes")}</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder={t("appointments.notesPlaceholder")}
                  />
                  {touched.notes && errors.notes && (
                    <p className="text-xs text-destructive">{errors.notes}</p>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("appointments.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {appointment ? t("appointments.updateAppointment") : t("appointments.createAppointment")}
                </Button>
              </DialogFooter>
            </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
