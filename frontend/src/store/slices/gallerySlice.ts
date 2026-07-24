import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, ApiError } from "@/lib/api";
import type { GalleryItem } from "@/types";

type State = {
  items: GalleryItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: State = { items: [], status: "idle", error: null };

export const fetchGallery = createAsyncThunk("gallery/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.getGallery();
    return res.items as GalleryItem[];
  } catch (err) {
    return rejectWithValue(err instanceof ApiError ? err.message : "Failed to load gallery");
  }
});

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load gallery";
      });
  },
});

export default gallerySlice.reducer;
