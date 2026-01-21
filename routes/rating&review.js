const express = require("express")
const router = express.Router();

const {
  editReview,
  getProductReviews,
  getProductRatingSummary,
  addReview,
  hasReviewed,
  getShopReviewSummary,
} = require("../controller/rating&review.js");
const { auth, isOwner } = require("../middleware/auth.js");

/* ================= USER ACTIONS ================= */

// Add Review (with images)
router.post("/add", auth, addReview);

// Edit Review
router.put("/edit", auth, editReview);

/* ================= FETCH ================= */

// Get all reviews of a product
router.post("/allReview", getProductReviews);

// Get rating summary (stars, bars, avg)
router.post("/ratingSummary", getProductRatingSummary);

router.post("/has-reviewed", auth, hasReviewed);

router.get("/getShopReviewSummary", auth, isOwner, getShopReviewSummary);

module.exports = router;
