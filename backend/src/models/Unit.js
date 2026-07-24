const mongoose = require("mongoose");

// A single apartment unit within a tower.
// `status` is the field the atomic booking logic guards -
// booking is nothing more than a conditional flip of this field
// from "available" to "booked", scoped by Mongo's per-document
// write atomicity (see routes/book.js).
const unitSchema = new mongoose.Schema(
  {
    tower: { type: String, required: true, trim: true },
    unitNumber: { type: String, required: true, trim: true },
    floor: { type: Number },
    type: { type: String, default: "2BHK" }, // e.g. 1BHK/2BHK/3BHK
    price: { type: Number },
    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available",
    },
    bookedBy: {
      customerName: { type: String },
      phone: { type: String },
    },
    bookedAt: { type: Date },
  },
  { timestamps: true }
);

unitSchema.index({ tower: 1, unitNumber: 1 }, { unique: true });

module.exports = mongoose.model("Unit", unitSchema);
