const express = require("express");
const app = express();
const {dbConnection}  = require("./config/connectDB");
const cors = require("cors");
const passport = require("./utility/passport.js");
const session = require("express-session");

const authRoutes = require("./routes/auth.js");
const googleAuthRoutes = require("./routes/google.js");

const port = process.env.PORT || 4000;

// data base connection
dbConnection();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//mounting
app.use("/api/v1/auth", authRoutes);
app.use("/auth", googleAuthRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});