const express = require("express");
const router = express.Router();
const passport = require("../utility/passport.js");

const {
  googleCallbackForShop,
  googleCallbackForUser,
} = require("../controller/auth.js");

// SHOP
router.get(
  "/shop/google",
  passport.authenticate("google-shop", { scope: ["profile", "email"] })
);

router.get(
  "/shop/google/callback",
  passport.authenticate("google-shop", { session: false }),
  googleCallbackForShop
);

// USER
router.get("/user/google", (req, res, next) => {
  const { shopId } = req.query;
  console.log(shopId, "fronted se aa kaya");

  passport.authenticate("google-user", {
    scope: ["profile", "email"],
    state: JSON.stringify({ shopId }),
  })(req, res, next);
});

router.get(
  "/user/google/callback",
  passport.authenticate("google-user", { session: false }),
  googleCallbackForUser
);


module.exports = router;
