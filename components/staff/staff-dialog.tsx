"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { StaffMember } from "@/types/staff";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  isActive: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!isEdit) {
    if (
      !values.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    )
      errors.email = "Valid email is required.";
    if (!values.password || values.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffMember;
  onSubmit: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    isActive: boolean;
  }) => Promise<void>;
}

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  onSubmit,
}: StaffDialogProps) {
  const isEdit = !!staff;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [values, setValues] = useState<FormValues>({
    firstName: staff?.firstName ?? "",
    lastName: staff?.lastName ?? "",
    email: staff?.email ?? "",
    password: "",
    phone: staff?.phone ?? "",
    isActive: staff?.isActive ?? true,
  });

  // Reset when dialog opens for a different staff member
  const [lastId, setLastId] = useState<string | undefined>();
  if (staff?.id !== lastId) {
    setLastId(staff?.id);
    setValues({
      firstName: staff?.firstName ?? "",
      lastName: staff?.lastName ?? "",
      email: staff?.email ?? "",
      password: "",
      phone: staff?.phone ?? "",
      isActive: staff?.isActive ?? true,
    });
    setErrors({});
  }

  function onChange(key: keyof FormValues, value: string | boolean) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values, isEdit);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim() || undefined,
        isActive: values.isActive,
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update team member details."
              : "Add a new worker to your organization."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={values.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                placeholder="Jane"
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={values.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          {!isEdit && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="jane@example.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+385 91 123 4567"
              disabled={loading}
            />
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Can accept appointments
                </p>
              </div>
              <Switch
                id="isActive"
                checked={values.isActive}
                onCheckedChange={(v) => onChange("isActive", v)}
                disabled={loading}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
