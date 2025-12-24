const express = require("express");
const router = express.Router();

const { auth,isOwner } = require("../middleware/auth");

const {
  updateShopProfile,
  updateContactInfo,
  updateShopAddress,
  updateShopTiming,
  getMyShop,
} = require("../controller/shop");

router.get("/my-shop", auth, isOwner, getMyShop);

// ===== STEP 1 =====
router.put("/profile", auth, isOwner, updateShopProfile);

// ===== STEP 2 =====
router.put("/contact", auth, isOwner, updateContactInfo);

// ===== STEP 3 =====
router.put("/address", auth, isOwner, updateShopAddress);

// ===== STEP 4 =====
router.put("/timing", auth,isOwner, updateShopTiming);

module.exports = router;
