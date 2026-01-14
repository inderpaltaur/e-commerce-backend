import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import siteInfoController from '../controllers/siteInfo.controller.js';
import {
  updateSiteInfoSchema,
  uploadLogoSchema,
  uploadFaviconSchema,
  initializeSiteInfoSchema
} from '../validations/siteInfo.validation.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get site info
router.get('/', siteInfoController.getSiteInfo);

// Admin Routes (Auth + Admin Role Required)

// Update site info
router.put(
  '/',
  verifyToken,
  checkAdmin,
  validate(updateSiteInfoSchema),
  siteInfoController.updateSiteInfo
);

// Upload logo
router.post(
  '/logo',
  verifyToken,
  checkAdmin,
  validate(uploadLogoSchema),
  siteInfoController.uploadLogo
);

// Upload favicon
router.post(
  '/favicon',
  verifyToken,
  checkAdmin,
  validate(uploadFaviconSchema),
  siteInfoController.uploadFavicon
);

// Initialize default site info (one-time setup)
router.post(
  '/initialize',
  verifyToken,
  checkAdmin,
  validate(initializeSiteInfoSchema),
  siteInfoController.initializeSiteInfo
);

export default router;