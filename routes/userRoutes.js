const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');

// Get user profile
router.get('/:id', getProfile);

// Update user profile
router.put('/:id', updateProfile);

module.exports = router;
