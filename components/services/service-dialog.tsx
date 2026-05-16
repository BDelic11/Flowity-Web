"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { ServiceData } from "@/types/service";
import ServiceSchema from "@/schemas/services-schema";
import { useLocale } from "@/contexts/locale-context";

type StaffBrief = { id: string; name: string };

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: ServiceData;
  staffList: StaffBrief[];
  isAdmin: boolean;
  onSubmit: (payload: ServiceData) => Promise<void>;
}

type FormValues = {
  name: string;
  description: string;
  durationMin: string;
  price: string;
  color: string;
};

type FormErrors = Partial<Record<keyof FormValues | "workerIds", string>>;

function validate(values: FormValues, workerIds: string[]): FormErrors {
  const errors: FormErrors = {};
  const priceNum =
    values.price === "" ? undefined : Number(values.price);

  const parsed = ServiceSchema.safeParse({
    name: values.name,
    description: values.description || undefined,
    duration: Number(values.durationMin),
    priceMin: priceNum,
    priceMax: priceNum,
    color: values.color,
    assignedStaffIds: workerIds,
  });

  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      const k = i.path[0] as string | undefined;
      if (!k) continue;
      const fieldKey =
        k === "duration"
          ? "durationMin"
          : k === "assignedStaffIds"
          ? "workerIds"
          : k === "priceMin" || k === "priceMax"
          ? "price"
          : (k as keyof FormErrors);
      if (!errors[fieldKey as keyof FormErrors]) {
        (errors as Record<string, string>)[fieldKey] = i.message;
      }
    }
  }
  return errors;
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSubmit,
  staffList,
  isAdmin,
}: ServiceDialogProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [values, setValues] = useState<FormValues>({
    name: service?.name ?? "",
    description: service?.description ?? "",
    durationMin: service?.durationMin?.toString() ?? "60",
    price: service?.priceMin?.toString() ?? "",
    color: service?.color ?? "#3b82f6",
  });

  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>(
    service?.workerIds ?? []
  );

  useEffect(() => {
    if (!open) return;
    setValues({
      name: service?.name ?? "",
      description: service?.description ?? "",
      durationMin: service?.durationMin?.toString() ?? "60",
      price: service?.priceMin?.toString() ?? "",
      color: service?.color ?? "#3b82f6",
    });
    setSelectedWorkerIds(service?.workerIds ?? []);
    setErrors({});
  }, [open, service?.id]);

  function onChange(key: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleWorker(id: string) {
    setSelectedWorkerIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
    setErrors((e) => ({ ...e, workerIds: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values, selectedWorkerIds);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const price = values.price !== "" ? Number(values.price) : null;
      await onSubmit({
        id: service?.id ?? "",
        name: values.name.trim(),
        description: values.description.trim() || null,
        durationMin: Number(values.durationMin),
        bufferBeforeMin: 0,
        bufferAfterMin: 0,
        priceMin: price,
        priceMax: price,
        color: values.color,
        isActive: service?.isActive ?? true,
        workerIds: selectedWorkerIds,
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Update service details below."
              : "Add a new service to your salon."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g., Haircut"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{t(errors.name!)}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Brief description of the service"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="durationMin">Duration (minutes)</Label>
              <Input
                id="durationMin"
                type="number"
                value={values.durationMin}
                onChange={(e) => onChange("durationMin", e.target.value)}
                min={5}
                step={5}
                max={480}
              />
              {errors.durationMin && (
                <p className="text-sm text-destructive">{t(errors.durationMin!)}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                value={values.price}
                onChange={(e) => onChange("price", e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{t(errors.price!)}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Calendar Color</Label>
            <div className="flex gap-2">
              <Input
                id="color-picker"
                type="color"
                value={values.color}
                onChange={(e) => onChange("color", e.target.value)}
                className="h-10 w-20 cursor-pointer p-1"
              />
              <Input
                id="color"
                value={values.color}
                onChange={(e) => onChange("color", e.target.value)}
                placeholder="#3b82f6"
              />
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{t(errors.color!)}</p>
            )}
          </div>

          {/* Staff assignment — required, must pick at least one */}
          <div className="grid gap-2">
            <Label>
              Staff{" "}
              <span className="text-destructive">*</span>
            </Label>
            {staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No staff members found. Add staff before creating services.
              </p>
            ) : (
              <div className="rounded-md border p-3 space-y-2 max-h-44 overflow-y-auto">
                {staffList.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={selectedWorkerIds.includes(s.id)}
                      onCheckedChange={() => toggleWorker(s.id)}
                      disabled={!isAdmin}
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.workerIds && (
              <p className="text-sm text-destructive">{t(errors.workerIds!)}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isAdmin && staffList.length === 0)}>
              {loading
                ? "Saving..."
                : service
                ? "Update Service"
                : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
