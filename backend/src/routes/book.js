const express = require("express");
const Unit = require("../models/Unit");
const {
  broadcastInventoryChange,
  broadcastBookingResult,
} = require("../socket");

const router = express.Router();

function isValidPhone(phone) {
  return typeof phone === "string" && /^[0-9+\-\s]{7,15}$/.test(phone.trim());
}

// POST /book { unitId, customerName, phone }
//
// Atomicity: MongoDB guarantees a single document write
// (findOneAndUpdate) is atomic - no other write can interleave with
// it on that document. By putting `status: "available"` in the
// filter(not just the update), the DB itself acts as the
// compare-and-swap: if two requests race for the same unit, only the
// first one's filter still matches "available" by the time it's
// applied; the second one's filter matches zero documents and the
// update is a no-op. We don't need an app-level lock or a
// transaction for a single-document update - this is the standard
// atomic pattern for "claim one of N resources" in Mongo.

router.post("/", async (req, res) => {
  const io = req.app.get("io");
  const { unitId, customerName, phone } = req.body || {};

  if (!unitId || !customerName || !customerName.trim()) {
    return res
      .status(400)
      .json({ message: "Customer name and unit are required" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Enter a valid phone number" });
  }

  try {
    const updated = await Unit.findOneAndUpdate(
      { _id: unitId, status: "available" }, // <- the atomic guard
      {
        $set: {
          status: "booked",
          bookedBy: { customerName: customerName.trim(), phone: phone.trim() },
          bookedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!updated) {
      // Either the unit doesn't exist, or someone else booked it a
      // moment ago (the race condition case the assignment asks for).
      const existing = await Unit.findById(unitId);
      const message = existing
        ? "This unit has already been booked."
        : "Unit not found.";

      broadcastBookingResult(io, { unitId, status: "error", message });
      return res.status(409).json({ message });
    }

    broadcastInventoryChange(io, updated);
    broadcastBookingResult(io, {
      unitId,
      status: "success",
      message: `Unit ${updated.unitNumber} booked successfully.`,
    });

    res.status(200).json({ unit: updated });
  } catch (err) {
    console.error("[book] failed:", err.message);
    res.status(500).json({ message: "Booking failed due to a server error" });
  }
});

module.exports = router;
