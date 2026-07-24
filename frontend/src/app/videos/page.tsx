"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchVideos } from "@/store/slices/videosSlice";
import { useMirrorAction } from "@/components/SocketProvider";
import { LoadingState, ErrorState } from "@/components/Status";

function formatDuration(sec?: number) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideosPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.videos);
  const mirror = useMirrorAction();

  useEffect(() => {
    if (status === "idle") dispatch(fetchVideos());
  }, [status, dispatch]);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="Loading videos…" />;
  }
  if (status === "failed") {
    return <ErrorState message={error || "Failed to load videos"} onRetry={() => dispatch(fetchVideos())} />;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-semibold text-kiosk-text">Project Videos</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item._id}
            onClick={() =>
              mirror({ playingVideo: { id: item._id, videoUrl: item.videoUrl, title: item.title } })
            }
            className="group overflow-hidden rounded-lg border border-kiosk-border bg-kiosk-panel text-left"
          >
            <div className="relative aspect-video w-full bg-black">
              {item.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kiosk-accent text-kiosk-bg">
                  ▶
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <p className="truncate text-xs text-kiosk-text">{item.title}</p>
              <span className="text-xs text-kiosk-subtext">{formatDuration(item.durationSeconds)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
