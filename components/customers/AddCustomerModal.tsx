"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer } from "@/app/api/hooks/customers/useGetCustomers";
import { parseApiError } from "@/lib/api-errors";

type Props = {
  open: boolean;
  onClose: () => void;
};

const empty = { displayName: "", phone: "", email: "" };

export function AddCustomerModal({ open, onClose }: Props) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const createCustomer = useCreateCustomer();

  function set(key: keyof typeof empty, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setFormError(null);
  }

  function validate() {
    const errs: Partial<typeof empty> = {};
    if (!form.displayName.trim()) errs.displayName = "Ime je obavezno.";
    if (!form.phone.trim()) errs.phone = "Broj telefona je obavezan.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Upiši ispravnu e-poštu.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await createCustomer.mutateAsync({
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      });
      setForm(empty);
      setErrors({});
      onClose();
    } catch (err) {
      const parsed = parseApiError(err, "Greška pri dodavanju klijenta.");
      setFormError(parsed.message);
    }
  }

  function handleClose() {
    setForm(empty);
    setErrors({});
    setFormError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Dodaj klijenta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">
              Ime i prezime <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="npr. Marko Horvat"
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Broj telefona <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="npr. +385912345678"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              inputMode="tel"
              aria-invalid={!!errors.phone}
            />
            {errors.phone ? (
              <p className="text-xs text-destructive">{errors.phone}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Preporučeni format: +385912345678
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-pošta (opcionalnog)</Label>
            <Input
              id="email"
              type="email"
              placeholder="marko@primjer.hr"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              inputMode="email"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              className="flex-1"
              disabled={createCustomer.isPending}
            >
              {createCustomer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Dodaj klijenta
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Odustani
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
