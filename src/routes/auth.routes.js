import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controller.js';
import {
  registerSchema,
  loginSchema,
  socialAuthSchema,
  verifyTokenSchema,
  generateCustomTokenSchema,
  refreshTokenSchema,
  linkProviderSchema,
  unlinkProviderSchema
} from '../validations/auth.validation.js';

const router = express.Router();

// Register
router.post(
  '/register',
  validate(registerSchema),
  authController.register
);

// Login
router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

// Social Authentication (Google, Facebook, etc.)
router.post(
  '/social-auth',
  validate(socialAuthSchema),
  authController.socialAuth
);

// Verify token
router.post(
  '/verify',
  validate(verifyTokenSchema),
  authController.verifyToken
);

// Generate custom token
router.post(
  '/custom-token',
  validate(generateCustomTokenSchema),
  authController.generateCustomToken
);

// Refresh token
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Link OAuth provider (authenticated)
router.post(
  '/link-provider',
  verifyToken,
  validate(linkProviderSchema),
  authController.linkProvider
);

// Unlink OAuth provider (authenticated)
router.post(
  '/unlink-provider',
  verifyToken,
  validate(unlinkProviderSchema),
  authController.unlinkProvider
);

// Get linked providers (authenticated)
router.get(
  '/linked-providers',
  verifyToken,
  authController.getLinkedProviders
);

// Revoke all tokens (logout from all devices) (authenticated)
router.post(
  '/revoke-tokens',
  verifyToken,
  authController.revokeTokens
);

// Check authentication status and claims
router.get(
  '/me',
  verifyToken,
  authController.getCurrentUser
);

export default router;
