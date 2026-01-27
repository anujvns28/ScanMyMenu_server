const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getKitchenOrders,
  updateOrderStatus,
  getMyActiveOrder,
  deleteOrderAfterCompletion,
} = require("../controller/Order");

const { auth, isOwner } = require("../middleware/auth");

// User places order (before payment)
router.post("/create", auth, createOrder);

// Razorpay payment verify
router.post("/payment/verify", auth, verifyPayment);

// User floating order status
router.get("/my-active", auth, getMyActiveOrder);

// Kitchen – get active orders
router.get("/kitchen/:shopId", auth, isOwner, getKitchenOrders);

// Kitchen – update status
router.put("/updateOrderStatus", auth, isOwner, updateOrderStatus);

router.delete("/delete/:orderId", deleteOrderAfterCompletion);

module.exports = router;
