"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Home,
  Tag,
  Menu,
  MessageSquare,
  Contact,
  Download,
  Package,
  Building2,
  User as UserIcon,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useLocale, LOCALE_LABELS, type Locale } from "@/contexts/locale-context";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useLogout } from "@/app/api/hooks/auth/useLogOut";
import { routes } from "@/constants/routes";
import { Roles } from "@/constants/roles";
import logoIconSmall from "@/public/logos/logo-only.png";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();
  const authUser = user.user;
  const { t, locale, setLocale } = useLocale();
  const { mutate: logout } = useLogout();
  const [open, setOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  function handleSignOut() {
    setSigningOut(true);
    logout();
    setOpen(false);
    router.push(routes.login);
    router.refresh();
  }

  const baseNav = [
    { key: "nav.dashboard", href: "/dashboard", icon: Home },
    { key: "nav.calendar", href: "/dashboard/calendar", icon: Calendar },
    {
      key: "nav.services",
      href: "/dashboard/services",
      icon: Tag,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
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
    {
      key: "nav.clients",
      href: "/dashboard/clients",
      icon: Contact,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
    {
      key: "nav.products",
      href: "/dashboard/products",
      icon: Package,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
    {
      key: "nav.export",
      href: "/dashboard/export",
      icon: Download,
      roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
    },
    {
      key: "nav.organizations",
      href: "/select-organization",
      icon: Building2,
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
            className="flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Home"
          >
            {/* <span className="text-base font-bold text-primary-foreground">
              F
            </span> */}
            <Image
              src={logoIconSmall}
              alt={"Logo icon small flowity"}
              width={64}
              height={64}
              className="h-12 w-12 rounded-md object-cover"
            />
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
            <SheetContent side="top" className="p-0 max-h-[85vh] overflow-y-auto">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-sm">{t("nav.menu")}</SheetTitle>
              </SheetHeader>

              {authUser && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback>
                        {authUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {authUser.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {authUser.email}
                      </p>
                    </div>
                  </div>
                  <NotificationBell />
                </div>
              )}

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

              <div className="border-t py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>{t("header.profile")}</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  <span>{t("header.settings")}</span>
                </Link>
              </div>

              <div className="border-t py-1">
                <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>{t("header.language")}</span>
                </div>
                <div className="flex flex-wrap gap-2 px-4 pb-2">
                  {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                        locale === l
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      {LOCALE_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t py-1">
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  <span>
                    {signingOut ? t("header.signingOut") : t("header.signOut")}
                  </span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* DESKTOP: hover-expand left rail */}
      <aside className="group hidden md:flex fixed left-0 top-0 z-40 h-screen w-16 hover:w-56 transition-all duration-200 ease-in-out border-r bg-card flex-col overflow-hidden">
        <div className="flex h-full flex-col py-4">
          {/* Logo */}
          <Link
            href="/"
            className="mb-8 mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full "
          >
            {/* <span className="text-lg font-bold text-primary-foreground">F</span> */}
            <Image
              src={logoIconSmall}
              alt={"Logo icon small flowity"}
              width={64}
              height={64}
              className="h-12 w-12 rounded-md object-cover"
            />
          </Link>

          <nav className="flex flex-1 flex-col gap-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-lg px-3 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    {t(item.key)}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
