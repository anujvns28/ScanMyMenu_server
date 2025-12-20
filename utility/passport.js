// utils/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { googleKeys } = require("../config/googleConfig.js");
const user = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleKeys.clientID,
      clientSecret: googleKeys.clientSecret,
      callbackURL: googleKeys.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // STEP 1 → Find user by email (BEST practice)
        let existingUser = await user.findOne({ email: profile.emails[0].value });

        // STEP 2 → If user does NOT exist → create new one
        if (!existingUser) {
          existingUser = await user.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            // avatar: profile.photos?.[0]?.value || "",
          });
        }

        console.log(profile, "Google Profile Data");

        return done(null, existingUser);
      } catch (error) {
        console.log("GOOGLE AUTH ERROR:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const userDetails = await user.findById(id);
  done(null, userDetails);
});

module.exports = passport;
