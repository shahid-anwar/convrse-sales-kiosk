"use client";

import { useAppSelector } from "@/store/hooks";
import { useMirrorAction } from "./SocketProvider";
import { useDwellSignal } from "@/lib/useDwellSignal";

export default function VideoPlayerModal() {
  const playing = useAppSelector((s) => s.session.playingVideo);
  const mirror = useMirrorAction();

  useDwellSignal(playing ? { type: "video", refId: playing.id, label: playing.title } : null);

  if (!playing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={() => mirror({ playingVideo: null })}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-lg border border-kiosk-border bg-kiosk-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          key={playing.id}
          src={playing.videoUrl}
          controls
          autoPlay
          className="max-h-[70vh] w-full bg-black"
        />
        <div className="flex items-center justify-between border-t border-kiosk-border px-4 py-3">
          <p className="text-sm text-kiosk-text">{playing.title}</p>
          <button
            onClick={() => mirror({ playingVideo: null })}
            className="rounded-md border border-kiosk-border px-3 py-1 text-xs text-kiosk-subtext hover:text-kiosk-text"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
