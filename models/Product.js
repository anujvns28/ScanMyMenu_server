const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopCategory",
      required: true,
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    portion: {
      type: String,
      enum: ["small", "medium", "large", "full", "half"],
    },

    type: {
      type: String,
      enum: ["none", "veg", "non-veg", "mix"],
      default: "none",
    },

    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],

    spiceLevel: {
      type: String,
      enum: ["none", "mild", "medium", "spicy", "extra-spicy"],
      default: "none",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isTodaySpecial: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      default: 10,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    orderCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product",productSchema)
