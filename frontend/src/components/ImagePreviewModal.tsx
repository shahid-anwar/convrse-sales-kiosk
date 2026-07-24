"use client";

import { useAppSelector } from "@/store/hooks";
import { useMirrorAction } from "./SocketProvider";
import { useDwellSignal } from "@/lib/useDwellSignal";

export default function ImagePreviewModal() {
  const preview = useAppSelector((s) => s.session.imagePreview);
  const mirror = useMirrorAction();

  useDwellSignal(preview ? { type: "image", refId: preview.id, label: preview.title } : null);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => mirror({ imagePreview: null })}
    >
      <div
        className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-lg border border-kiosk-border bg-kiosk-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview.imageUrl}
          alt={preview.title}
          className="max-h-[75vh] w-full object-contain"
        />
        <div className="flex items-center justify-between border-t border-kiosk-border px-4 py-3">
          <p className="text-sm text-kiosk-text">{preview.title}</p>
          <button
            onClick={() => mirror({ imagePreview: null })}
            className="rounded-md border border-kiosk-border px-3 py-1 text-xs text-kiosk-subtext hover:text-kiosk-text"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
