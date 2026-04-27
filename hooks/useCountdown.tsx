"use client";

import { useEffect, useMemo, useState } from "react";

export default function useCountdown(targetISO?: string | null) {
  const [now, setNow] = useState<number>(() => Date.now());

  // tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { msLeft, label } = useMemo(() => {
    if (!targetISO) return { msLeft: null as number | null, label: "" };

    const target = new Date(targetISO).getTime();
    if (Number.isNaN(target))
      return { msLeft: null as number | null, label: "" };

    const diff = Math.max(0, target - now);

    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = totalSeconds % 60;

    let text: string;
    if (diff < 60_000) {
      // < 1 minute -> seconds
      text = `${totalSeconds}s`;
    } else if (diff < 3_600_000) {
      // < 1 hour -> minutes
      text = `${totalMinutes}m`;
    } else {
      // >= 1 hour -> hours + minutes
      text = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return { msLeft: diff, label: text };
  }, [targetISO, now]);

  return { msLeft, label };
}
