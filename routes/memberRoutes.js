const express = require("express");
const router = express.Router();
const { getAllMembers } = require("../controllers/memberController");

// ✅ Route for fetching all members
router.get("/", getAllMembers);

module.exports = router;
