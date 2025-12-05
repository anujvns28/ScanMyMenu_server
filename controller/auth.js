
const bcrypt = require("bcrypt");
const { default: user } = require("../models/user");

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

    const isExistUser = await User.find({ email: email });
    if (isExistUser) {
      return res.status(400).json({
        success: false,
        message: "user alredy exists",
      });
    }

    const hassedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hassedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "user created successfully",
      user: newUser,
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
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"all filds are required"
        })
    }

    const userDetailes = await user.findOne({email});

    if(!userDetailes){
        return res.status(400).json({
            success:false,
            message:"user not registered"
        })
    }

    if(await bcrypt.compare(password,userDetailes.password)){
        return res.status(200).json({
            success : true,
            message : "Login successfull"
        })
    }
    else{
        return res.status(500).json({
            success : false,
            message : "password not matched "
        })
    }
    
  } catch (err) {
    console.log(err, "errror occurd in login");
    return res.status(500).json({
      success: false,
      message: "error occured while login"+err,
      
    });
  }
};
