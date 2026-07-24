import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import SocketProvider from "@/components/SocketProvider";
import NavTabs from "@/components/NavTabs";
import TabSync from "@/components/TabSync";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import BookingDialog from "@/components/BookingDialog";
import BookingToast from "@/components/BookingToast";
import InterestFeed from "@/components/InterestFeed";

export const metadata: Metadata = {
  title: "Convrse Sales Kiosk",
  description: "Sales Kiosk Application - Convrse Spaces technical assignment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-kiosk-bg text-kiosk-text">
        <StoreProvider>
          <SocketProvider>
            <TabSync />
            <NavTabs />
            <main className="mx-auto max-w-6xl">{children}</main>

            {/* Global overlays - these mirror across every connected
                device regardless of which page is showing, because
                they're driven by session state, not local UI state. */}
            <ImagePreviewModal />
            <VideoPlayerModal />
            <BookingDialog />
            <BookingToast />
            <InterestFeed />
          </SocketProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
