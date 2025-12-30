const express = require("express");
const router = express.Router();

const {
  pickCategoriesForShop,
  getShopCategories,
  removeShopCategory,
  toggleCategoryStatus,
  getSingleShopCategory,
  pickTags,
  removeTag,
} = require("../controller/shopCategory");

const { auth, isOwner } = require("../middleware/auth");

router.post("/pickCategories", auth, isOwner, pickCategoriesForShop);

router.post("/getCategories", getShopCategories);

router.post("/shopCategoryDetails", auth, isOwner, getSingleShopCategory);

router.delete("/remove", auth, isOwner, removeShopCategory);

router.put("/toggleCategory", auth, isOwner, toggleCategoryStatus);
router.put("/pickTags",auth,isOwner,pickTags)
router.put("/removeTag",auth,isOwner,removeTag)

module.exports = router;
