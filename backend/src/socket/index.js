const { getState, patchState } = require("./sessionState");

// Actions a client is allowed to mirror. Keeping an allowlist here
// means a malformed/malicious client can't stuff arbitrary keys into
// shared state.
const ALLOWED_KEYS = new Set([
  "activeTab",
  "imagePreview",
  "playingVideo",
  "selectedTower",
  "selectedUnit",
  "bookingDialog",
]);

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    // Send the newly-connected device the current shared state so it
    // joins mid-session already in sync (e.g. customer screen turns
    // on after the exec has already opened the Inventory tab).
    socket.emit("session:state", getState());

    // A client changed something locally (switched tab, opened a
    // preview, selected a unit, opened the booking dialog, etc).
    // Validate + merge into shared state, then broadcast to
    // *everyone* (including the sender, for simplicity/consistency).
    socket.on("session:update", (patch) => {
      if (!patch || typeof patch !== "object") return;

      const safePatch = {};
      for (const key of Object.keys(patch)) {
        if (ALLOWED_KEYS.has(key)) safePatch[key] = patch[key];
      }
      if (Object.keys(safePatch).length === 0) return;

      const newState = patchState(safePatch);
      io.emit("session:state", newState);
    });

    // Beyond the Scope: interest signal ping (buyer lingered on X).
    // Broadcast so the exec's device can show a live "interest" feed
    // without needing to poll.
    socket.on("interest:signal", (signal) => {
      if (!signal || typeof signal !== "object") return;
      io.emit("interest:signal", { ...signal, at: Date.now() });
    });

    socket.on("disconnect", () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

// Called by the /book route after a booking succeeds/fails so every
// device's Inventory view updates instantly, and so the booking
// dialog on all devices reflects the outcome.
function broadcastInventoryChange(io, unit) {
  io.emit("inventory:updated", unit);
}

function broadcastBookingResult(io, result) {
  const newState = patchState({ lastBookingResult: result });
  io.emit("session:state", newState);
}

module.exports = { initSocket, broadcastInventoryChange, broadcastBookingResult };
