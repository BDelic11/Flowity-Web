// components/common/use-confirm.tsx
"use client";

import * as React from "react";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useCallback, useRef, useState } from "react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  cancelLabel?: string;
};

export function useConfirm() {
  const [open, setOpen] = React.useState(false);
  const resolver = useRef<(v: boolean) => void>(null);

  const confirm = useCallback((opts?: ConfirmOptions) => {
    setDialogOpts({
      title: opts?.title ?? "Are you sure?",
      description: opts?.description ?? "This action cannot be undone.",
      confirmLabel: opts?.confirmLabel ?? "Confirm",
      confirmVariant: opts?.confirmVariant ?? "destructive",
      cancelLabel: opts?.cancelLabel ?? "Cancel",
    });
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const [dialogOpts, setDialogOpts] = useState<ConfirmOptions>({
    title: "Are you sure?",
    description: "This action cannot be undone.",
    confirmLabel: "Confirm",
    confirmVariant: "destructive",
    cancelLabel: "Cancel",
  });

  function handleConfirm() {
    resolver.current?.(true);
    setOpen(false);
  }

  function handleCancel() {
    resolver.current?.(false);
    setOpen(false);
  }

  const DialogEl = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title={dialogOpts.title}
      description={dialogOpts.description}
      confirmLabel={dialogOpts.confirmLabel}
      confirmVariant={dialogOpts.confirmVariant}
      cancelLabel={dialogOpts.cancelLabel}
      showLoading={false}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmPortal: DialogEl };
}
