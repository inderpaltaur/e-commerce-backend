import express from 'express';
import {
  initializeSuperAdmin,
  checkSuperAdminExists
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

export default router;
