const express = require('express');
const router = express.Router();
const { verifyToken, checkAdmin } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// Get current user profile (authenticated)
router.get('/profile', verifyToken, userController.getUserProfile);

// Update user profile (authenticated)
router.put('/profile', verifyToken, userController.updateUserProfile);

// Get all users (admin only)
router.get('/', verifyToken, checkAdmin, userController.getAllUsers);

// Set admin role (admin only)
router.put('/:uid/set-admin', verifyToken, checkAdmin, userController.setAdminRole);

module.exports = router;
