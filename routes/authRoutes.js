const express = require("express");
const {
  register,
  login,
  forgotPassword,
  verifyLoginOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// ✅ New Routes
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/reset-password", resetPassword);

module.exports = router;

