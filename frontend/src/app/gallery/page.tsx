"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGallery } from "@/store/slices/gallerySlice";
import { useMirrorAction } from "@/components/SocketProvider";
import { LoadingState, ErrorState } from "@/components/Status";

export default function GalleryPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.gallery);
  const mirror = useMirrorAction();

  useEffect(() => {
    if (status === "idle") dispatch(fetchGallery());
  }, [status, dispatch]);

  if (status === "loading" || status === "idle") {
    return <LoadingState label="Loading gallery…" />;
  }
  if (status === "failed") {
    return <ErrorState message={error || "Failed to load gallery"} onRetry={() => dispatch(fetchGallery())} />;
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-semibold text-kiosk-text">Project Gallery</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item._id}
            onClick={() =>
              mirror({ imagePreview: { id: item._id, imageUrl: item.imageUrl, title: item.title } })
            }
            className="group overflow-hidden rounded-lg border border-kiosk-border bg-kiosk-panel text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumbnailUrl || item.imageUrl}
              alt={item.title}
              className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <p className="truncate px-2 py-2 text-xs text-kiosk-subtext">{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
