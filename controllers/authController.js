const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/mailer");

// Mailer setup


// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, mobile, address, dob, gender } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });
    if (await User.findOne({ mobile }))
      return res.status(400).json({ message: "Mobile number already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      dob,
      gender,
      joiningDate: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name, email, mobile, address, dob, gender },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




// Login → send OTP
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Your OTP for Login",
      `Your OTP is: <b>${otp}</b> (valid for 5 minutes)`
    );

    res.json({ message: "✅ OTP sent", user: { id: user._id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Verify OTP
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "✅ Login successful", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password → send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP is: <b>${otp}</b> (valid for 5 minutes)`
    );

    res.json({ message: "✅ OTP sent for password reset" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "✅ Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
