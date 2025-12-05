const express = require("express");
const app = express();
const {dbConnection}  = require("./config/connectDB");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const port = process.env.PORT || 4000;

// data base connection
dbConnection();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

//mounting
app.use("/api/v1/auth",authRoutes)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});