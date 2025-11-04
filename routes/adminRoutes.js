const express = require("express");
const { createNotice, getNotices } = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

// Only admin can create notices
router.post("/notices", authMiddleware, adminMiddleware, createNotice);

// Any logged-in user can see notices
router.get("/notices", authMiddleware, getNotices);

module.exports = router;
