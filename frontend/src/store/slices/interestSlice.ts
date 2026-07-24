import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { InterestSignal } from "@/types";

type State = { signals: InterestSignal[] };

const initialState: State = { signals: [] };

const MAX_SIGNALS = 20;

const interestSlice = createSlice({
  name: "interest",
  initialState,
  reducers: {
    signalReceived(state, action: PayloadAction<InterestSignal>) {
      state.signals.unshift(action.payload);
      if (state.signals.length > MAX_SIGNALS) state.signals.length = MAX_SIGNALS;
    },
  },
});

export const { signalReceived } = interestSlice.actions;
export default interestSlice.reducer;
