const express = require("express");
const { auth, isAdmin } = require("../middleware/auth");
const { createTag, updateTag, toggleTagStatus, getAllTags } = require("../controller/tags");
const router = express.Router();

router.post("/createTag",auth,isAdmin,createTag);
router.post("/updateTag",auth,isAdmin,updateTag);
router.post("/toggleTagStatus",auth,isAdmin,toggleTagStatus);
router.get("/getAllTag",auth,isAdmin,getAllTags)

module.exports = router;