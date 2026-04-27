"use client";

import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

function hexIsDark(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return false;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  // Perceived luminance
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L < 160; // tune threshold if needed
}

type CardProps = {
  apt: Appointment;
  top: number;
  height: number;
  onClick: () => void;
  muted?: boolean;
};

function AppointmentCard({ apt, top, height, onClick, muted }: CardProps) {
  const darkBg = hexIsDark(apt.color);
  const isTiny = height < 36;
  const isSmall = height >= 36 && height < 64; // show time + client (1 line)

  return (
    <div
      title={`${apt.startTime}–${apt.endTime} • ${apt.clientName} • ${apt.serviceName}`}
      className={cn(
        "absolute left-1 right-1 rounded-md p-1.5 text-[13px]",
        "cursor-pointer transition-all hover:shadow-md ring-1",
        darkBg ? "ring-black/15" : "ring-black/10",
        muted && "opacity-60 grayscale"
      )}
      style={{ top, height, backgroundColor: apt.color }}
      onClick={onClick}
    >
      {/* inner text wrapper with readable contrast */}
      <div
        className={cn(
          "h-full w-full",
          darkBg
            ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
            : "text-gray-900"
        )}
      >
        {/* TIME (always visible) */}
        <div className="font-medium leading-tight">
          {apt.startTime} - {apt.endTime}
        </div>

        {/* TINY → only time */}
        {isTiny ? null : (
          <>
            {/* SMALL → one-line client */}
            <div
              className={cn(
                "font-semibold leading-tight",
                isSmall ? "truncate" : ""
              )}
            >
              {apt.clientName}
            </div>

            {/* NORMAL → service line */}
            {!isSmall && (
              <div className="text-xs opacity-90 leading-tight">
                {apt.serviceName}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AppointmentCard;
