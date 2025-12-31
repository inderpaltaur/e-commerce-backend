import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import userController from '../controllers/user.controller.js';

const router = express.Router();

// ===== User Profile Routes =====
// Get current user profile (authenticated)
router.get('/profile', verifyToken, userController.getUserProfile);

// Update user profile (authenticated)
router.put('/profile', verifyToken, userController.updateUserProfile);

// ===== Wishlist Routes =====
// Get wishlist (authenticated)
router.get('/wishlist', verifyToken, userController.getWishlist);

// Add to wishlist (authenticated)
router.post(
  '/wishlist',
  verifyToken,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    validate
  ],
  userController.addToWishlist
);

// Remove from wishlist (authenticated)
router.delete('/wishlist/:productId', verifyToken, userController.removeFromWishlist);

// ===== Verification Routes =====
// Verify phone number (authenticated)
router.post('/verify-phone', verifyToken, userController.verifyPhoneNumber);

// Verify email (authenticated)
router.post('/verify-email', verifyToken, userController.verifyEmail);

// ===== Admin Routes =====
// Get all users (admin only)
router.get('/', verifyToken, checkAdmin, userController.getAllUsers);

// Set admin role (admin only)
router.put('/:uid/set-admin', verifyToken, checkAdmin, userController.setAdminRole);

// Update account status (admin only)
router.put(
  '/:uid/account-status',
  verifyToken,
  checkAdmin,
  [
    body('accountStatus')
      .isIn(['active', 'blocked', 'suspended'])
      .withMessage('Invalid account status'),
    validate
  ],
  userController.updateAccountStatus
);

export default router;
