const mongoose = require("mongoose");

const shopCategorySchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    displayName: {
      type: String,
    },

    // Menu me category ka order
    order: {
      type: Number,
      default: 0,
    },

    isEnabled: {
      type: Boolean,
      default: true,
    },

    // Kya ye category menu me highlight ho
    isFeatured: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);



module.exports = mongoose.model("ShopCategory", shopCategorySchema);
