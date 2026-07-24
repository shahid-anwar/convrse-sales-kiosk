"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useMirrorAction } from "./SocketProvider";
import type { ActiveTab } from "@/types";

const TABS: { key: ActiveTab; label: string; path: string }[] = [
  { key: "gallery", label: "Gallery", path: "/gallery" },
  { key: "videos", label: "Videos", path: "/videos" },
  { key: "inventory", label: "Inventory", path: "/inventory" },
];

export default function NavTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const mirror = useMirrorAction();
  const connected = useAppSelector((s) => s.session.connected);

  function selectTab(tab: (typeof TABS)[number]) {
    router.push(tab.path);
    mirror({ activeTab: tab.key });
  }

  return (
    <div className="flex items-center justify-between border-b border-kiosk-border bg-kiosk-panel px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-kiosk-text">
          Convrse<span className="text-kiosk-accent"> Kiosk</span>
        </span>
      </div>
      <nav className="flex gap-1 rounded-lg bg-kiosk-bg p-1">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.path);
          return (
            <button
              key={tab.key}
              onClick={() => selectTab(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-kiosk-accent text-kiosk-bg"
                  : "text-kiosk-subtext hover:text-kiosk-text"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-2 text-xs text-kiosk-subtext">
        <span
          className={`h-2 w-2 rounded-full ${connected ? "bg-kiosk-accent" : "bg-kiosk-danger"}`}
          aria-hidden
        />
        {connected ? "Synced" : "Reconnecting…"}
      </div>
    </div>
  );
}
