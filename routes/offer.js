const express = require("express");
const router = express.Router();
const {
  createOffer,
  getAllOffers,
  getActiveOffers,
  updateOffer,
  deleteOffer,
} = require("../controller/offer");
const { auth, isOwner } = require("../middleware/auth");

router.post("/create", auth, isOwner, createOffer);
router.get("/all", auth, isOwner, getAllOffers);
router.get("/active/:shopId", getActiveOffers);
router.put("/update", auth, isOwner, updateOffer);
router.delete("/delete/:offerId", auth, isOwner, deleteOffer);

module.exports = router;
