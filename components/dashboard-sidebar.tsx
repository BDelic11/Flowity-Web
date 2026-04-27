"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Settings, Home, Tag, Menu, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Roles } from "@/constants/roles";

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuth();
  const { t } = useLocale();
  const [open, setOpen] = React.useState(false);

  const baseNav = [
    { key: "nav.dashboard", href: "/dashboard", icon: Home },
    { key: "nav.calendar", href: "/dashboard/calendar", icon: Calendar },
    {
      key: "nav.services",
      href: "/dashboard/services",
      icon: Tag,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
    // Settings visible to all roles — Workers see profile-only, Admins see full org settings
    { key: "nav.settings", href: "/dashboard/settings", icon: Settings },
    {
      key: "nav.staff",
      href: "/dashboard/staff",
      icon: Users,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
    {
      key: "nav.whatsapp",
      href: "/dashboard/whatsapp",
      icon: MessageSquare,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
  ];

  const navigation = baseNav.filter(
    (item) =>
      !item.roles || (user && item.roles.includes((user.role as Roles) || ""))
  );

  return (
    <>
      {/* MOBILE: sticky top navbar with burger */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary"
            aria-label="Home"
          >
            <span className="text-base font-bold text-primary-foreground">
              F
            </span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
                aria-label={t("nav.openMenu")}
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>

            {/* slide from top */}
            <SheetContent side="top" className="p-0">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-sm">{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="py-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4", isActive && "text-primary")}
                      />
                      <span>{t(item.key)}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* DESKTOP: original left rail */}
      <aside className="hidden md:block fixed left-0 top-0 z-40 h-screen w-16 border-r bg-card">
        <div className="flex h-full flex-col items-center py-4">
          <Link
            href="/"
            className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary"
          >
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={t(item.key)}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
