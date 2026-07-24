export type GalleryItem = {
  _id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
};

export type VideoItem = {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
};

export type UnitStatus = "available" | "booked";

export type Unit = {
  _id: string;
  tower: string;
  unitNumber: string;
  floor?: number;
  type?: string;
  price?: number;
  status: UnitStatus;
  bookedBy?: { customerName: string; phone: string };
};

export type TowerGroup = {
  tower: string;
  units: Unit[];
};

export type ImagePreviewState = { id: string; imageUrl: string; title: string } | null;
export type PlayingVideoState = { id: string; videoUrl: string; title: string } | null;
export type SelectedUnitState = { unitId: string; tower: string; unitNumber: string } | null;
export type BookingDialogState = { unitId: string; tower: string; unitNumber: string } | null;
export type BookingResult = { unitId: string; status: "success" | "error"; message: string } | null;

export type ActiveTab = "gallery" | "videos" | "inventory";

// Mirrors backend/src/socket/sessionState.js - this is the single
// shared kiosk session state broadcast to every connected device.
export type SessionState = {
  activeTab: ActiveTab;
  imagePreview: ImagePreviewState;
  playingVideo: PlayingVideoState;
  selectedTower: string | null;
  selectedUnit: SelectedUnitState;
  bookingDialog: BookingDialogState;
  lastBookingResult: BookingResult;
};

export type InterestSignal = {
  sessionId: string;
  type: "image" | "video" | "unit";
  refId: string;
  label?: string;
  dwellMs?: number;
  at?: number;
};
