"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: string;
  description?: string;

  confirmLabel?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "secondary"
    | "outline"
    | "ghost"
    | "link";

  cancelLabel?: string;

  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;

  showLoading?: boolean;
  disableWhileLoading?: boolean;
  children?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  confirmVariant = "destructive",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  showLoading = true,
  disableWhileLoading = true,
  children,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    try {
      if (showLoading) setPending(true);
      await onConfirm?.();
      onOpenChange(false);
    } finally {
      if (showLoading) setPending(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    onOpenChange(false);
  }

  const blockClose = disableWhileLoading && pending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (!blockClose ? onOpenChange(v) : null)}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
