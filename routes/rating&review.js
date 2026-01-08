const express = require("express")
const router = express.Router();

const {
  editReview,
  getProductReviews,
  getProductRatingSummary,
  addReview,
} = require("../controller/rating&review.js");
const { auth } = require("../middleware/auth.js");



/* ================= USER ACTIONS ================= */

// Add Review (with images)
router.post(
  "/add",
  auth,
  addReview
);

// Edit Review
router.put(
  "/edit",
  auth,
  editReview
);

/* ================= FETCH ================= */

// Get all reviews of a product
router.get("/allReview", getProductReviews);

// Get rating summary (stars, bars, avg)
router.get("/ratngSummary", getProductRatingSummary);

module.exports = router;
