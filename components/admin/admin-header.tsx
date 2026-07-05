"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Ticket, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { apiRoutes, routes } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";

const ADMIN_NAV = [{ label: "Prijave", href: routes.tickets, icon: Ticket }];

/**
 * Minimal top bar for the standalone SuperAdmin panel. Deliberately independent from
 * DashboardSidebar — no organization/tenant context here, so it doesn't reuse it.
 */
export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    try {
      await api.post(apiRoutes.logout);
    } catch {
      // ignore — clear local session regardless
    }
    localStorage.removeItem("token");
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    router.push(routes.adminLogin);
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-card">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href={routes.tickets} className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Admin Panel</span>
          </Link>

          <nav className="flex items-center gap-1">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Odjava</span>
          </button>
        </div>
      </div>
    </header>
  );
}
