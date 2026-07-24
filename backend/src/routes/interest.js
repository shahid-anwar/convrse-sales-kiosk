const express = require("express");
const InterestSignal = require("../models/InterestSignal");

const router = express.Router();

// GET /interest -> most recent signals, newest first (for a
// post-visit review or a late-joining device to catch up on).
router.get("/", async (req, res) => {
  try {
    const signals = await InterestSignal.find().sort({ createdAt: -1 }).limit(50);
    res.json({ signals });
  } catch (err) {
    console.error("[interest] fetch failed:", err.message);
    res.status(500).json({ message: "Failed to load interest signals" });
  }
});

// POST /interest { sessionId, type, refId, label, dwellMs }
// Persists the signal AND broadcasts it over the socket so the
// executive's "what caught their eye" feed updates live, without
// polling.
router.post("/", async (req, res) => {
  try {
    const { sessionId, type, refId, label, dwellMs } = req.body || {};
    if (!sessionId || !type || !refId) {
      return res.status(400).json({ message: "sessionId, type and refId are required" });
    }
    const signal = await InterestSignal.create({ sessionId, type, refId, label, dwellMs });

    const io = req.app.get("io");
    if (io) io.emit("interest:signal", signal);

    res.status(201).json({ signal });
  } catch (err) {
    console.error("[interest] create failed:", err.message);
    res.status(500).json({ message: "Failed to log interest signal" });
  }
});

module.exports = router;
