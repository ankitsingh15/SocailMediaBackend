const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responsiveWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    if (!email || !password || !name) {
      //   return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      //   return res.status(409).send("User Already registered");
      return res.send(error(409, "User Already registered"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
    });
    // return res.status(201).json({
    //   user,
    // });

    return res.send(success(201, "User Created Successfully"));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      //   return res.status(400).send("All fields are required");
      return res.send(error(400, "All fields are required"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      //   return res.status(409).send("User Not registered");
      return res.send(error(409, "User Not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      //   return res.status(403).send("Incorrect password");
      return res.send(error(403, "Incorrect password"));
    }

    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = generateRefreshToken({ _id: user._id });

    //saving refresh Token in Cookie Install Cookie-parser
    try {
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
      });
    } catch (e) {
      res.send(error(500, e.message()));
    }

    // return res.json({ accessToken });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    res.send(error(401, e.message));
  }
};

//Api will check the refreshToken Validity and create new access Token
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  console.log("Cookie token is ", cookies.jwt);
  if (!cookies.jwt) {
    // return res.status(401).send("refresh Token in cookie is Reqd");
    return res.send(error(401, "refresh Token in cookie is Reqd"));
  }
  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );
    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });
    // return res.status(201).json({ accessToken });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    // return res.send("Invalid refresh key");
    return res.send(error(401, "Invalid refresh key"));
  }
};

//Internal Functions for creating Token
const generateAccessToken = (data) => {
  const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
    expiresIn: "1d",
  });
  console.log(token);
  return token;
};

const generateRefreshToken = (data) => {
  const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
    expiresIn: "1y",
  });
  console.log(token);
  return token;
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "user Logged Out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};
