"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Globe } from "lucide-react";
import { useLocale, LOCALE_LABELS, type Locale } from "@/contexts/locale-context";

interface Props {
  userName: string;
  tenantName: string;
  onSignOut: () => void;
}

export function DashboardHeaderClient({
  userName,
  tenantName,
  onSignOut,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { t, locale, setLocale } = useLocale();

  function handleSignOut() {
    start(() => {
      onSignOut();
      router.push(routes.login);
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-xl font-semibold">{tenantName}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
              <DropdownMenuItem
                key={l}
                onClick={() => setLocale(l)}
                className={locale === l ? "font-semibold text-primary" : ""}
              >
                {LOCALE_LABELS[l]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full"
            disabled={pending}
          >
            <Avatar>
              <AvatarFallback>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            {t("header.profile")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={pending}>
            <LogOut className="mr-2 h-4 w-4" />
            {pending ? t("header.signingOut") : t("header.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
