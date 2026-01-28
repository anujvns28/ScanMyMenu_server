const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    shopProfile: {
      name: { type: String, trim: true },
      logo: { type: String },
    },

    contactInfo: {
      ownerName: { type: String, trim: true },
      phone: { type: String },
      email: { type: String },
    },

    address: {
      area: { type: String },
      city: { type: String },
      pincode: { type: String },
    },

    timing: {
      openTime: { type: String },
      closeTime: { type: String },
    },

    progress: {
      type: Number,
      default: 0, // 0 to 100
    },

    qrCode: { type: String },

    totalScans: { type: Number, default: 0 },
    // models/Shop.js
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    status: {
      creationStep: { type: Number, default: 0 },
      isProfileComplete: { type: Boolean, default: false },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Shop", shopSchema);
