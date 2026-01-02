import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import userController from '../controllers/user.controller.js';
import {
  updateProfileSchema,
  addToWishlistSchema,
  removeFromWishlistSchema,
  getAllUsersQuerySchema,
  userIdParamSchema,
  updateAccountStatusSchema,
  updateRoleSchema
} from '../validations/user.validation.js';

const router = express.Router();

// ===== User Profile Routes =====
// Get current user profile (authenticated)
router.get(
  '/profile',
  verifyToken,
  userController.getUserProfile
);

// Update user profile (authenticated)
router.put(
  '/profile',
  verifyToken,
  validate(updateProfileSchema),
  userController.updateUserProfile
);

// ===== Wishlist Routes =====
// Get wishlist (authenticated)
router.get(
  '/wishlist',
  verifyToken,
  userController.getWishlist
);

// Add to wishlist (authenticated)
router.post(
  '/wishlist',
  verifyToken,
  validate(addToWishlistSchema),
  userController.addToWishlist
);

// Remove from wishlist (authenticated)
router.delete(
  '/wishlist/:productId',
  verifyToken,
  validate(removeFromWishlistSchema),
  userController.removeFromWishlist
);

// ===== Verification Routes =====
// Verify phone number (authenticated)
router.post(
  '/verify-phone',
  verifyToken,
  userController.verifyPhoneNumber
);

// Verify email (authenticated)
router.post(
  '/verify-email',
  verifyToken,
  userController.verifyEmail
);

// ===== Admin Routes =====
// Get all users (admin only)
router.get(
  '/',
  verifyToken,
  checkAdmin,
  validate(getAllUsersQuerySchema),
  userController.getAllUsers
);

// Set admin role (admin only)
router.put(
  '/:uid/set-admin',
  verifyToken,
  checkAdmin,
  validate(userIdParamSchema),
  userController.setAdminRole
);

// Update account status (admin only)
router.put(
  '/:uid/account-status',
  verifyToken,
  checkAdmin,
  validate(updateAccountStatusSchema),
  userController.updateAccountStatus
);

export default router;
