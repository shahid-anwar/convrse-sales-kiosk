// A kiosk deployment is one showroom session: the executive's tablet
// and the customer's screen are two clients mirroring one shared
// state. We keep that state in memory on the server (source of truth
// for "what's on screen right now") and broadcast every change to all
// connected sockets. This is intentionally NOT persisted to Mongo -
// it's ephemeral UI state, not business data (inventory/bookings are
// the persisted, authoritative data).
//
// If you needed multiple independent kiosks running concurrently
// (multiple showrooms), you'd key this by a sessionId/roomId instead
// of a single global object - the shape below is written so that
// extension is a small change (see README "Future improvements").

const defaultState = {
  activeTab: "gallery", // "gallery" | "videos" | "inventory"
  imagePreview: null, // { id, imageUrl, title } | null
  playingVideo: null, // { id, videoUrl, title } | null
  selectedTower: null, // string | null
  selectedUnit: null, // { unitId, tower, unitNumber } | null
  bookingDialog: null, // { unitId, tower, unitNumber } | null
  lastBookingResult: null, // { unitId, status: "success"|"error", message } | null
};

let state = { ...defaultState };

function getState() {
  return state;
}

function patchState(patch) {
  state = { ...state, ...patch };
  return state;
}

function resetState() {
  state = { ...defaultState };
  return state;
}

module.exports = { getState, patchState, resetState };
