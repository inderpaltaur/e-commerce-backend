import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('photoURL').optional().isURL().withMessage('Invalid photo URL'),
    body('authProvider').optional().isString(),
    validate
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

// Social Authentication (Google, Facebook, etc.)
router.post(
  '/social-auth',
  [
    body('uid').notEmpty().withMessage('User ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('authProvider').notEmpty().withMessage('Auth provider is required'),
    body('photoURL').optional().isURL().withMessage('Invalid photo URL'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    validate
  ],
  authController.socialAuth
);

// Verify token
router.post('/verify', authController.verifyToken);

// Generate custom token
router.post(
  '/custom-token',
  [
    body('uid').notEmpty().withMessage('User ID is required'),
    validate
  ],
  authController.generateCustomToken
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Link OAuth provider (authenticated)
router.post(
  '/link-provider',
  verifyToken,
  [
    body('uid').notEmpty().withMessage('User ID is required'),
    body('provider').notEmpty().withMessage('Provider is required'),
    body('providerUid').notEmpty().withMessage('Provider UID is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    validate
  ],
  authController.linkProvider
);

// Unlink OAuth provider (authenticated)
router.post(
  '/unlink-provider',
  verifyToken,
  [
    body('uid').notEmpty().withMessage('User ID is required'),
    body('provider').notEmpty().withMessage('Provider is required'),
    validate
  ],
  authController.unlinkProvider
);

// Get linked providers (authenticated)
router.get('/linked-providers', verifyToken, authController.getLinkedProviders);

// Revoke all tokens (logout from all devices) (authenticated)
router.post('/revoke-tokens', verifyToken, authController.revokeTokens);

export default router;
