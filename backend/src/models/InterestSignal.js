const mongoose = require("mongoose");

// Beyond the Scope: lightweight "interest signal" log.
// Every time a buyer's screen lingers on an image/video/unit for more
// than a couple of seconds, the frontend logs it here. This lets the
// sales executive see a running "what caught their eye" feed - useful
// for steering the pitch and for post-visit CRM follow-up.
const interestSignalSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["image", "video", "unit"],
      required: true,
    },
    refId: { type: String, required: true }, // id or label of the item
    label: { type: String },
    dwellMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterestSignal", interestSignalSchema);
