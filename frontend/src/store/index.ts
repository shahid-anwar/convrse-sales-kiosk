import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./slices/sessionSlice";
import galleryReducer from "./slices/gallerySlice";
import videosReducer from "./slices/videosSlice";
import inventoryReducer from "./slices/inventorySlice";
import interestReducer from "./slices/interestSlice";

export function makeStore() {
  return configureStore({
    reducer: {
      session: sessionReducer,
      gallery: galleryReducer,
      videos: videosReducer,
      inventory: inventoryReducer,
      interest: interestReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
