const express = require("express");
const Unit = require("../models/Unit");

const router = express.Router();

// GET /inventory -> grouped by tower for easy rendering
router.get("/", async (req, res) => {
  try {
    const units = await Unit.find().sort({ tower: 1, unitNumber: 1 });

    const towers = {};
    for (const unit of units) {
      if (!towers[unit.tower]) towers[unit.tower] = [];
      towers[unit.tower].push(unit);
    }

    res.json({
      towers: Object.entries(towers).map(([tower, units]) => ({
        tower,
        units,
      })),
    });
  } catch (err) {
    console.error("[inventory] fetch failed:", err.message);
    res.status(500).json({ message: "Failed to load inventory" });
  }
});

module.exports = router;
