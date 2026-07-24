const express = require("express");
const Video = require("../models/Video");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await Video.find().sort({ order: 1, createdAt: 1 });
    res.json({ items });
  } catch (err) {
    console.error("[videos] fetch failed:", err.message);
    res.status(500).json({ message: "Failed to load videos" });
  }
});

module.exports = router;
