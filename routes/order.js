const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getKitchenOrders,
  updateOrderStatus,
  getMyActiveOrder,
} = require("../controller/Order");

const { auth, isShopOwner } = require("../middlewares/auth");

// User places order (before payment)
router.post("/create", auth, createOrder);

// Razorpay payment verify
router.post("/payment/verify", auth, verifyPayment);

// User floating order status
router.get("/my-active", auth, getMyActiveOrder);

// Kitchen – get active orders
router.get("/kitchen/:shopId", auth, isShopOwner, getKitchenOrders);

// Kitchen – update status
router.put("/:orderId/status", auth, isShopOwner, updateOrderStatus);

module.exports = router;
