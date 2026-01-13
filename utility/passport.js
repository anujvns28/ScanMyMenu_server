const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { googleKeys } = require("../config/googleConfig.js");
const User = require("../models/user");

/* SHOPKEEPER */
passport.use(
  "google-shop",
  new GoogleStrategy(
    {
      clientID: googleKeys.clientID,
      clientSecret: googleKeys.clientSecret,
      callbackURL: googleKeys.shopCallback,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value,
          role: "owner",
        });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "owner",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* CUSTOMER */
passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: googleKeys.clientID,
      clientSecret: googleKeys.clientSecret,
      callbackURL: googleKeys.userCallback,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          email: profile.emails[0].value,
          role: "user",
        });

        console.log(user, "this is user ");

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            role: "user",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const userDetails = await User.findById(id);
  done(null, userDetails);
});

module.exports = passport;
