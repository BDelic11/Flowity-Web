"use client";

import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/contexts/notification-context";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";
import type { AnyNotification } from "@/types/notification";

function NotificationRow({
  n,
  t,
}: {
  n: AnyNotification;
  t: (key: string) => string;
}) {
  if (n.type === "NewBooking") {
    return (
      <div
        className={cn(
          "flex gap-3 border-b px-4 py-3 text-sm last:border-0",
          !n.read && "bg-muted/40"
        )}
      >
        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
        <div>
          <p className="font-medium">{t("notifications.newBooking")}</p>
          <p className="text-muted-foreground">
            {n.clientName} — {n.serviceName}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {new Date(n.startAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 border-b px-4 py-3 text-sm last:border-0",
        !n.read && "bg-muted/40"
      )}
    >
      <div
        className={cn(
          "mt-0.5 h-2 w-2 shrink-0 rounded-full",
          n.type === "OutOfStock" ? "bg-red-500" : "bg-amber-400"
        )}
      />
      <div>
        <p className="font-medium">
          {n.type === "OutOfStock"
            ? t("notifications.outOfStock")
            : t("notifications.lowStock")}
        </p>
        <p className="text-muted-foreground">
          {n.productName} — {n.stockQty} {n.unit}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {new Date(n.occurredAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const { t } = useLocale();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) markAllRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h4 className="font-semibold text-sm">{t("notifications.title")}</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </p>
          ) : (
            notifications.map((n) => <NotificationRow key={n.id} n={n} t={t} />)
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
