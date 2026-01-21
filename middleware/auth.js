const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token === "null") {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
  

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const accountType = req.user.role;

    if (accountType !== "Admin") {
      return res.status(500).json({
        success: false,
        message: "This is protected route for Admin",
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Error ocurring in stduent middlewrre",
    });
  }
};

exports.isOwner = async (req, res, next) => {
  try {
    const accountType = req.user.role;

    if (accountType !== "owner") {
      return res.status(500).json({
        success: false,
        message: "This is protected route for owner",
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Error ocurring in stduent middlewrre",
    });
  }
};
