"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";
import type { InterestSignal } from "@/types";

const DWELL_THRESHOLD_MS = 2500;

// Call with the item currently being viewed (or null when nothing
// is). Logs an interest signal once the item has been on screen
// longer than DWELL_THRESHOLD_MS - a quick glance doesn't count,
// but genuinely lingering on a unit/image/video does.

export function useDwellSignal(
  item: { type: InterestSignal["type"]; refId: string; label?: string } | null,
) {
  const startedAt = useRef<number | null>(null);
  const current = useRef<typeof item>(null);

  useEffect(() => {
    const prev = current.current;
    current.current = item;

    // Item changed away from what we were tracking - log dwell time
    // for the previous one if it crossed the threshold.

    if (prev && startedAt.current) {
      const dwellMs = Date.now() - startedAt.current;
      if (dwellMs >= DWELL_THRESHOLD_MS) {
        api
          .logInterest({
            sessionId: getDeviceId(),
            type: prev.type,
            refId: prev.refId,
            label: prev.label,
            dwellMs,
          })
          .catch(() => {
            // Best-effort telemetry - never surface this to the user.
          });
      }
    }

    startedAt.current = item ? Date.now() : null;
  }, [item?.type, item?.refId]);
}
