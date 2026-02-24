const express = require("express");
const app = express();
const {dbConnection}  = require("./config/connectDB");
const cors = require("cors");
const passport = require("./utility/passport.js");
const session = require("express-session");
const path = require("path");
const axios = require("axios");

const authRoutes = require("./routes/auth.js");
const googleAuthRoutes = require("./routes/google.js");
const categoryRoutes = require("./routes/category.js");
const tagRoutes = require("./routes/tag.js");
const shopRoutes = require("./routes/shop.js");
const productRoutes = require("./routes/Product.js");
const shop_categoryRoutes = require("./routes/shopCategory.js");
const ratingRoutes = require("./routes/rating&review.js");
const orderRoutes = require("./routes/order.js");
const offerRoutes = require("./routes/offer.js");
const { cloudinaryConnect } = require("./config/cloudinary.js");
const fileUpload = require("express-fileupload");
const { seedFakeReviews } = require("./faker/fakeReview.js");
const {
  syncProductRatings,
  syncShopRatings,
} = require("./faker/syncRating.js");

const port = process.env.PORT || 4000;

// data base connection
dbConnection();
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://10.81/171.153:5173",
      "https://scanmymenu.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());


//mounting
app.use("/api/v1/auth", authRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/tag", tagRoutes);
app.use("/api/v1/shop", shopRoutes);
app.use("/api/v1/shop-category", shop_categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/rating", ratingRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/offers", offerRoutes);
cloudinaryConnect();



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Keep-alive function
const keepWarm = () => {
  const interval = 5 * 60 * 1000;
  const keepAliveUrl = `https://scanmymenu-server.onrender.com/keep-alive`;

  setInterval(async () => {
    try {
      console.log("Sending keep-alive request");
      const response = await axios.get(keepAliveUrl);
      console.log(`Keep-alive request status: ${response.status}`);
    } catch (error) {
      console.error("Error sending keep-alive request:", error);
    }
  }, interval);
};

keepWarm();
