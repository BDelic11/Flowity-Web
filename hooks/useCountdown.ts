"use client";

import { useEffect, useState } from "react";

function msToLabel(ms: number): string {
  if (ms <= 0) return "now";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function useCountdown(isoStart?: string | null) {
  const [msLeft, setMsLeft] = useState<number | null>(null);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!isoStart) {
      setMsLeft(null);
      setLabel(null);
      return;
    }

    const target = new Date(isoStart).getTime();

    function tick() {
      const diff = target - Date.now();
      setMsLeft(diff);
      setLabel(diff > 0 ? msToLabel(diff) : "now");
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoStart]);

  return { msLeft, label };
}
