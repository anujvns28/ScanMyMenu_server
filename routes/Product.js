const express = require("express");
const router = express.Router();

const {auth,isOwner} = require("../middleware/auth")

const {
  createProduct,
  getProductsByCategory,
  updateItemField,
  getTopRatedProducts,
  getProductDetails,
  getForYouData,
  getShopProductsForOffer,
} = require("../controller/Product");

router.post("/addProduct", auth, isOwner, createProduct);
router.post("/fetchCategoryProduct", getProductsByCategory);
router.put("/updateProduct", auth, isOwner, updateItemField);
router.get("/topRatedProducts", getTopRatedProducts);
router.post("/getProductDetails", getProductDetails);
router.get("/for-you/:shopId", getForYouData);
router.get("/getAllProducts", auth, isOwner, getShopProductsForOffer);

module.exports = router