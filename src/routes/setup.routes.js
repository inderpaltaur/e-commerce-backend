import express from 'express';
import {
  initializeSuperAdmin,
  checkSuperAdminExists,
  checkUserByEmail
} from '../controllers/setup.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { initializeSuperAdminSchema } from '../validations/setup.validation.js';

const router = express.Router();

// Check if super admin exists (public)
router.get('/check-super-admin', checkSuperAdminExists);

// Initialize super admin (one-time setup, public but protected by business logic)
router.post(
  '/initialize-super-admin',
  validate(initializeSuperAdminSchema),
  initializeSuperAdmin
);

// Diagnostic endpoint to check user data (public for debugging)
router.get('/check-user', checkUserByEmail);

export default router;
