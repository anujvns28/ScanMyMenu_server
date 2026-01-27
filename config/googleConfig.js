export const googleKeys = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  userCallback:
    "https://scanmymenu-server.onrender.com/auth/user/google/callback",
  shopCallback:
    "https://scanmymenu-server.onrender.com/auth/shop/google/callback",
};
