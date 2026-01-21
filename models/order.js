const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Snapshot (so price/name never change later)
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which restaurant (QR shop)
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    // Items ordered
    items: [orderItemSchema],

    // DINE_IN or TAKEAWAY
    orderType: {
      type: String,
      enum: ["DINE_IN", "TAKEAWAY"],
      required: true,
    },

    // Table for dine-in
    tableNo: String,

    // Phone for takeaway
    phone: String,

    // Cooking instructions
    instructions: String,

    // Bill
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Kitchen status
    status: {
      type: String,
      enum: [
        "CREATED", // Order created, waiting for payment
        "PLACED", // Payment done, sent to kitchen
        "PREPARING",
        "READY",
        "SERVED",
        "CANCELLED",
      ],
      default: "CREATED",
    },

    // Easy number for kitchen screen
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generate human readable order number
orderSchema.pre("save", function () {
  if (!this.orderNumber) {
    this.orderNumber = "SM-" + Date.now().toString().slice(-6);
  }
});

module.exports = mongoose.model("Order", orderSchema);
