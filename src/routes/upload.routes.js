import express from 'express';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import { upload, uploadProductImage, uploadProductImages, deleteImage } from '../controllers/upload.controller.js';

const router = express.Router();

// All upload routes require authentication and admin role

/**
 * @route   POST /api/upload/product-image
 * @desc    Upload single product image
 * @access  Private/Admin
 */
router.post(
  '/product-image',
  verifyToken,
  checkAdmin,
  upload.single('image'),
  uploadProductImage
);

/**
 * @route   POST /api/upload/product-images
 * @desc    Upload multiple product images
 * @access  Private/Admin
 */
router.post(
  '/product-images',
  verifyToken,
  checkAdmin,
  upload.array('images', 10), // Max 10 images
  uploadProductImages
);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from local storage
 * @access  Private/Admin
 */
router.delete(
  '/image',
  verifyToken,
  checkAdmin,
  deleteImage
);

export default router;
