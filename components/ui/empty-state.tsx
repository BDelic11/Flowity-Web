import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * Calm empty state used across pages (staff / services / products / etc).
 * The illustration prop expects an inline SVG drawn with `currentColor` and the
 * `text-primary` class on the wrapper so it tints with the brand color and stays
 * consistent in light/dark mode.
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-6 text-primary/80">{illustration}</div>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- Illustrations (undraw-inspired, tinted via currentColor) ---------- */

const FRAME = "h-40 w-40";

export function StaffIllustration() {
  return (
    <svg viewBox="0 0 200 160" className={FRAME} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="138" rx="78" ry="8" className="fill-primary/10" />
      <rect x="32" y="58" width="60" height="68" rx="10" className="fill-primary/15" />
      <rect x="108" y="46" width="60" height="80" rx="10" className="fill-primary/25" />
      <circle cx="62" cy="78" r="11" className="fill-background" stroke="currentColor" strokeWidth="2.5" />
      <path d="M44 110c2-9 10-14 18-14s16 5 18 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="fill-background" />
      <circle cx="138" cy="70" r="13" className="fill-background" stroke="currentColor" strokeWidth="2.5" />
      <path d="M116 108c3-11 12-17 22-17s19 6 22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="fill-background" />
      <circle cx="172" cy="44" r="6" className="fill-primary/40" />
      <circle cx="28" cy="50" r="4" className="fill-primary/30" />
    </svg>
  );
}

export function ServicesIllustration() {
  return (
    <svg viewBox="0 0 200 160" className={FRAME} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="140" rx="74" ry="7" className="fill-primary/10" />
      <rect x="38" y="38" width="124" height="84" rx="14" className="fill-primary/15" />
      <rect x="38" y="38" width="124" height="22" rx="14" className="fill-primary/30" />
      <circle cx="50" cy="49" r="3" className="fill-background" />
      <circle cx="60" cy="49" r="3" className="fill-background" />
      <circle cx="70" cy="49" r="3" className="fill-background" />
      <rect x="52" y="74" width="62" height="8" rx="4" stroke="currentColor" strokeWidth="2" className="fill-background" />
      <rect x="52" y="92" width="44" height="8" rx="4" stroke="currentColor" strokeWidth="2" className="fill-background" />
      <circle cx="140" cy="92" r="14" stroke="currentColor" strokeWidth="2.5" className="fill-background" />
      <path d="M134 92l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="28" r="5" className="fill-primary/40" />
      <circle cx="174" cy="120" r="4" className="fill-primary/30" />
    </svg>
  );
}

export function ProductsIllustration() {
  return (
    <svg viewBox="0 0 200 160" className={FRAME} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="140" rx="74" ry="7" className="fill-primary/10" />
      <path d="M100 36l52 22v40l-52 24-52-24V58l52-22z" className="fill-primary/15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 58l52 22 52-22" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 80v42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M74 48l52 22" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="170" cy="40" r="5" className="fill-primary/40" />
      <circle cx="30" cy="118" r="4" className="fill-primary/30" />
    </svg>
  );
}
