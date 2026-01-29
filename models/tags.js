const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["category", "product"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tag", tagSchema);
