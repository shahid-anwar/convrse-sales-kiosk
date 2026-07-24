import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SessionState } from "@/types";

type State = SessionState & { connected: boolean };

const initialState: State = {
  activeTab: "gallery",
  imagePreview: null,
  playingVideo: null,
  selectedTower: null,
  selectedUnit: null,
  bookingDialog: null,
  lastBookingResult: null,
  connected: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // Applied whenever the server broadcasts "session:state" - this
    // is what makes every connected device mirror the same screen.
    sessionStateReceived(state, action: PayloadAction<SessionState>) {
      Object.assign(state, action.payload);
    },
    connectionChanged(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    clearBookingResult(state) {
      state.lastBookingResult = null;
    },
  },
});

export const { sessionStateReceived, connectionChanged, clearBookingResult } = sessionSlice.actions;
export default sessionSlice.reducer;
