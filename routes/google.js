const express = require("express");
const router = express.Router();
const passport = require("../utility/passport.js");

const { googleCallback} = require("../controller/auth.js");


// Google login start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

module.exports = router;
