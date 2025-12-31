import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import categoryController from '../controllers/category.controller.js';

const router = express.Router();

// Get all categories (public)
router.get('/', categoryController.getAllCategories);

// Get single category (public)
router.get('/:id', categoryController.getCategoryById);

// Create category (admin only)
router.post(
  '/',
  verifyToken,
  checkAdmin,
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional(),
    validate
  ],
  categoryController.createCategory
);

// Update category (admin only)
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  categoryController.updateCategory
);

// Delete category (admin only)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  categoryController.deleteCategory
);

export default router;
