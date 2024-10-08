const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv");

require('dotenv').config();

const generateRefreshToken = async (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  const refreshToken = new RefreshToken({ token, userId, expiryDate });
  await refreshToken.save();
  return token;
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accesstoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshtoken = await generateRefreshToken(user._id);
    //res.cookie('refreshToken', rToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    //res.cookie('accesstoken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res
      .status(200)
      .json({
        message: "Login successful",
        redirectUrl: "/",
        accesstoken,
        refreshtoken,
        user,
      });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser };
