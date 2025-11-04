const express = require('express');
const router = express.Router();
const { getProfile, updateProfile ,uploadProfile} = require('../controllers/userController');
const upload = require("../middleware/upload");
// Get user profile
router.get('/:id', getProfile);

// Update user profile
router.put('/:id', updateProfile);
router.post("/:id/upload-profile", upload.single("profileImage"), uploadProfile);

module.exports = router;
