const express = require("express");
const router = express.Router();

const {auth,isOwner} = require("../middleware/auth")

const {createProduct,getProductsByCategory,updateItemField} = require("../controller/Product")

router.post("/addProduct",auth,isOwner,createProduct);
router.post("/fetchCategoryProduct",auth,isOwner,getProductsByCategory);
router.put("/updateProduct",auth,isOwner,updateItemField)

module.exports = router