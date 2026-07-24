import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, ApiError } from "@/lib/api";
import type { VideoItem } from "@/types";

type State = {
  items: VideoItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: State = { items: [], status: "idle", error: null };

export const fetchVideos = createAsyncThunk("videos/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.getVideos();
    return res.items as VideoItem[];
  } catch (err) {
    return rejectWithValue(err instanceof ApiError ? err.message : "Failed to load videos");
  }
});

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load videos";
      });
  },
});

export default videosSlice.reducer;
