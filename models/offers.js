const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    title: {
      type: String,
      required: true, // Burger Combo
    },

    description: {
      type: String, // What's included
    },

    image: {
      type: String, // Offer card image
    },

    /* ---------- COMBO PRODUCTS ---------- */

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    /* ---------- PRICING ---------- */

    originalPrice: {
      type: Number, // calculated (optional)
    },

    offerPrice: {
      type: Number, // FINAL PRICE user pays
      required: true,
    },

    /* ---------- VISIBILITY ---------- */

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false, // For You page top
    },

    /* ---------- VALIDITY ---------- */

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
