const express = require("express");
const router = express.Router();

const {
    createCategory,
    updateCategory,
    getAllCategories,
    getActiveCategories,
    toggleCategoryStatus
} = require("../controller/category");
const { auth,isAdmin,isOwner } = require("../middleware/auth");


router.post("/createCategory",auth,isAdmin,createCategory);
router.post("/updateCategory",auth,isAdmin,updateCategory);
router.post("/getAllCategories",auth,isAdmin,getAllCategories);
router.post("/toggleCategoryStatus",auth,isAdmin,toggleCategoryStatus);



module.exports = router;
