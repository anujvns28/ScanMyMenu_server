const express = require("express");
const router = express.Router();
const passport = require("../utility/passport.js");

const {
  googleCallback,
  login,
  signup,
  loginWithToken,
} = require("../controller/auth.js");
const { auth } = require("../middleware/auth.js");

// login
router.post("/login", login);

// signup
router.post("/signup", signup);

// login with token
router.get("/loginWithToken", auth, loginWithToken);

module.exports = router;
