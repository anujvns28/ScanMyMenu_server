const express = require("express");
const app = express();
const {dbConnection}  = require("./config/connectDB");
const cors = require("cors");
const passport = require("./utility/passport.js");
const session = require("express-session");

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

const port = process.env.PORT || 4000;

// data base connection
dbConnection();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://10.130.46.153:5173",
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