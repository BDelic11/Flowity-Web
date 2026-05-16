"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "type"> & {
  /** Localised label for the show/hide toggle button (accessibility only). */
  toggleLabelShow?: string;
  toggleLabelHide?: string;
};

/**
 * Single-line password field with a built-in show/hide eye toggle. Drop-in
 * replacement for `<Input type="password" />` so every auth/onboarding form
 * shares the same UX.
 */
export function PasswordInput({
  className,
  toggleLabelShow = "Show password",
  toggleLabelHide = "Hide password",
  ...props
}: Props) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        aria-label={visible ? toggleLabelHide : toggleLabelShow}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded p-2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
