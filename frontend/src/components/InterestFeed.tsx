"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

const TYPE_ICON: Record<string, string> = { image: "🖼", video: "▶", unit: "🏢" };

// Beyond the Scope: a live feed of what the buyer has been lingering
// on (images/videos/units held on screen for a few seconds). Meant
// to sit collapsed in a corner of the exec's device - a real signal
// of buyer interest, not just a checklist feature.
export default function InterestFeed() {
  const [open, setOpen] = useState(false);
  const signals = useAppSelector((s) => s.interest.signals);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-lg border border-kiosk-border bg-kiosk-panel px-3 py-2 text-xs font-medium text-kiosk-text shadow-lg"
      >
        <span>Buyer interest signals {signals.length > 0 && `(${signals.length})`}</span>
        <span className="text-kiosk-subtext">{open ? "▾" : "▴"}</span>
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto rounded-b-lg border border-t-0 border-kiosk-border bg-kiosk-panel p-2 shadow-lg">
          {signals.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-kiosk-subtext">
              Nothing yet - lingering on an image, video, or unit for a couple seconds
              logs it here.
            </p>
          ) : (
            <ul className="space-y-1">
              {signals.map((s, i) => (
                <li
                  key={`${s.refId}-${s.at}-${i}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-kiosk-text hover:bg-kiosk-bg"
                >
                  <span>{TYPE_ICON[s.type] || "•"}</span>
                  <span className="flex-1 truncate">{s.label || s.refId}</span>
                  <span className="text-kiosk-subtext">
                    {s.dwellMs ? `${Math.round(s.dwellMs / 1000)}s` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
