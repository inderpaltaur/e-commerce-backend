import express from 'express';
import {
  createAdminRequest,
  createPublicAdminRequest,
  checkAdminRequestByUserId,
  getAdminRequests,
  getMyAdminRequest,
  approveAdminRequest,
  rejectAdminRequest
} from '../controllers/admin-request.controller.js';
import { verifyToken, checkSuperAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createAdminRequestSchema,
  getAdminRequestsQuerySchema,
  reviewAdminRequestSchema
} from '../validations/admin-request.validation.js';

const router = express.Router();

// Public endpoint - Create admin request (for new users)
router.post(
  '/public',
  verifyToken, // Still verify token but don't check role
  createPublicAdminRequest
);

// Public endpoint - Check request status by user ID
router.get(
  '/check/:userId',
  verifyToken, // Still verify token but don't check role
  checkAdminRequestByUserId
);

// Create admin request (authenticated users only - legacy)
router.post(
  '/',
  verifyToken,
  validate(createAdminRequestSchema),
  createAdminRequest
);

// Get current user's admin request (authenticated users only)
router.get(
  '/my-request',
  verifyToken,
  getMyAdminRequest
);

// Get all admin requests (super admin only)
router.get(
  '/',
  verifyToken,
  checkSuperAdmin,
  validate(getAdminRequestsQuerySchema),
  getAdminRequests
);

// Approve admin request (super admin only)
router.put(
  '/:requestId/approve',
  verifyToken,
  checkSuperAdmin,
  validate(reviewAdminRequestSchema),
  approveAdminRequest
);

// Reject admin request (super admin only)
router.put(
  '/:requestId/reject',
  verifyToken,
  checkSuperAdmin,
  validate(reviewAdminRequestSchema),
  rejectAdminRequest
);

export default router;
