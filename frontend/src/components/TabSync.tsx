"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import type { ActiveTab } from "@/types";

const PATH_BY_TAB: Record<ActiveTab, string> = {
  gallery: "/gallery",
  videos: "/videos",
  inventory: "/inventory",
};

// When another device switches tabs, the server broadcasts the new
// activeTab and every client's Redux store updates. This component's
// only job is to translate that into an actual route change on
// *this* device, so the customer's screen follows the exec's
// navigation without anyone touching this browser.
export default function TabSync() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useAppSelector((s) => s.session.activeTab);
  const lastAppliedTab = useRef<ActiveTab | null>(null);

  useEffect(() => {
    const targetPath = PATH_BY_TAB[activeTab];
    if (!targetPath) return;
    if (pathname?.startsWith(targetPath)) {
      lastAppliedTab.current = activeTab;
      return;
    }
    // Avoid re-triggering a push for a tab we just applied.
    if (lastAppliedTab.current === activeTab) return;
    lastAppliedTab.current = activeTab;
    router.push(targetPath);
  }, [activeTab, pathname, router]);

  return null;
}
