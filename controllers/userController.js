const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: imageUrl },
      { new: true }
    ).select("-password -otp -otpExpiry");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "✅ Profile image uploaded",
      profileImage: `${req.protocol}://${req.get("host")}${imageUrl}`, // full URL
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};