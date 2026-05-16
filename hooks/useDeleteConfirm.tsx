"use client";

import { useCallback } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { useLocale } from "@/contexts/locale-context";

type AskOptions = {
  /** Subject name interpolated into the title — e.g. the row's name. */
  name?: string;
  /** Override the default title. */
  title?: string;
  /** Override the default description. */
  description?: string;
  /** Override the confirm button label. */
  confirmLabel?: string;
};

/**
 * Generic destructive-confirm hook: shared modal + localised defaults so every
 * "delete" action in the app uses the same UI without re-passing labels.
 *
 *   const { askDelete, ConfirmPortal } = useDeleteConfirm();
 *   if (await askDelete({ name: row.name })) await mutate(row.id);
 *   ...
 *   {ConfirmPortal}
 */
export function useDeleteConfirm() {
  const { confirm, ConfirmPortal } = useConfirm();
  const { t } = useLocale();

  const askDelete = useCallback(
    (opts: AskOptions = {}) =>
      confirm({
        title:
          opts.title ??
          (opts.name
            ? t("common.confirmDelete.titleNamed", { name: opts.name })
            : t("common.confirmDelete.title")),
        description: opts.description ?? t("common.confirmDelete.description"),
        confirmLabel: opts.confirmLabel ?? t("common.confirmDelete.confirm"),
        confirmVariant: "destructive",
        cancelLabel: t("common.cancel"),
      }),
    [confirm, t],
  );

  return { askDelete, ConfirmPortal };
}
