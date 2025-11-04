const User = require("../models/User");

// ✅ Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching members:", err.message);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};
