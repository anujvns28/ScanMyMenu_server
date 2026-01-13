
const bcrypt = require("bcrypt");
const user = require("../models/user");
const { generateToken } = require("../utility/generateToken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "all fillds are required",
      });
    }

    if (password != confirmPassword) {
      return res.status(402).json({
        success: false,
        message: "password or confirm password not matched",
      });
    }

    const isExistUser = await user.findOne({ email: email });
    console.log(isExistUser, "this is ");
    if (isExistUser) {
      return res.status(400).json({
        success: false,
        message: "user alredy exists",
      });
    }

    const hassedPassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      name: name,
      email: email,
      password: hassedPassword,
    });

    const token = generateToken(newUser._id);

    return res.status(200).json({
      success: true,
      message: "user created successfully",
      user: newUser,
      token: token,
    });
  } catch (err) {
    console.log(err, "errror occurd in signup");
    return res.status(500).json({
      success: false,
      message: "error occured while signup",
    });
  }
};

exports.login = async (req, res) => {
  try {
    // fetching daa
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all filds are required",
      });
    }

    const userDetailes = await user.findOne({ email });

    if (!userDetailes) {
      return res.status(400).json({
        success: false,
        message: "user not registered",
      });
    }

    if (await bcrypt.compare(password, userDetailes.password)) {
      const token = generateToken(userDetailes._id);

      return res.status(200).json({
        success: true,
        message: "Login successfull",
        token: token,
        user: userDetailes,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "password not matched ",
      });
    }
  } catch (err) {
    console.log(err, "errror occurd in login");
    return res.status(500).json({
      success: false,
      message: "error occured while login" + err,
    });
  }
};

exports.googleCallbackForShop = (req, res) => {
  // Successful login
  const token = generateToken(req.user._id);

  res.redirect(`http://localhost:5173/dashbord?token=${token}`);
};

exports.googleCallbackForUser = (req, res) => {
  try {
    const token = generateToken(req.user._id);

    let shopId = null;

    if (typeof req.query.state === "string") {
      shopId = JSON.parse(req.query.state).shopId;
    } else {
      shopId = req.query.state.shopId;
    }

    res.redirect(`http://localhost:5173/menu/${shopId}?token=${token}`);
  } catch (err) {
    console.error("Google Callback Error", err);
    res.redirect("http://localhost:5173/login");
  }
};



exports.loginWithToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await user.findById(userId);
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "invallid token",
      });
    }

    return res.status(200).json({
      success: true,
      message: "login with token success",
      user: userDetails,
    });
  } catch (err) {
    console.log(err, "log in with token error");
    return res.status(500).json({
      success: false,
      message: "login with token error",
    });
  }
};

