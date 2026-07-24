const express = require("express");
const GalleryItem = require("../models/GalleryItem");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ order: 1, createdAt: 1 });
    res.json({ items });
  } catch (err) {
    console.error("[gallery] fetch failed:", err.message);
    res.status(500).json({ message: "Failed to load gallery" });
  }
});

module.exports = router;
