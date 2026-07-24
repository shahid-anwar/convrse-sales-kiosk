import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api, ApiError } from "@/lib/api";
import type { TowerGroup, Unit } from "@/types";

type State = {
  towers: TowerGroup[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  bookingStatus: "idle" | "submitting" | "succeeded" | "failed";
  bookingError: string | null;
};

const initialState: State = {
  towers: [],
  status: "idle",
  error: null,
  bookingStatus: "idle",
  bookingError: null,
};

export const fetchInventory = createAsyncThunk("inventory/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.getInventory();
    return res.towers as TowerGroup[];
  } catch (err) {
    return rejectWithValue(err instanceof ApiError ? err.message : "Failed to load inventory");
  }
});

export const bookUnit = createAsyncThunk(
  "inventory/book",
  async (payload: { unitId: string; customerName: string; phone: string }, { rejectWithValue }) => {
    try {
      const res = await api.bookUnit(payload);
      return res.unit as Unit;
    } catch (err) {
      return rejectWithValue(err instanceof ApiError ? err.message : "Booking failed");
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Applied when the socket delivers "inventory:updated" - this is
    // what makes a booking made on Device A appear on Device B
    // instantly, without a refetch.
    unitUpdated(state, action: PayloadAction<Unit>) {
      const unit = action.payload;
      const group = state.towers.find((t) => t.tower === unit.tower);
      if (!group) return;
      const idx = group.units.findIndex((u) => u._id === unit._id);
      if (idx !== -1) group.units[idx] = unit;
    },
    resetBookingStatus(state) {
      state.bookingStatus = "idle";
      state.bookingError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.towers = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load inventory";
      })
      .addCase(bookUnit.pending, (state) => {
        state.bookingStatus = "submitting";
        state.bookingError = null;
      })
      .addCase(bookUnit.fulfilled, (state, action) => {
        state.bookingStatus = "succeeded";
        // Also apply locally in case the socket event arrives after
        // this response (belt-and-braces; unitUpdated will just
        // overwrite with the same data).
        const unit = action.payload;
        const group = state.towers.find((t) => t.tower === unit.tower);
        if (group) {
          const idx = group.units.findIndex((u) => u._id === unit._id);
          if (idx !== -1) group.units[idx] = unit;
        }
      })
      .addCase(bookUnit.rejected, (state, action) => {
        state.bookingStatus = "failed";
        state.bookingError = (action.payload as string) || "Booking failed";
      });
  },
});

export const { unitUpdated, resetBookingStatus } = inventorySlice.actions;
export default inventorySlice.reducer;
