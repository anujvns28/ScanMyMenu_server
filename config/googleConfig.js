export const googleKeys = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  userCallback: "http://localhost:4000/auth/user/google/callback",
  shopCallback: "http://localhost:4000/auth/shop/google/callback",
};
