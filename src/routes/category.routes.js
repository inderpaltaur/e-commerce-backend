import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import categoryController from '../controllers/category.controller.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by slug (must come before /:id to avoid route conflict)
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Get subcategories for a category
router.get('/:categoryId/subcategories', categoryController.getSubCategories);

// Admin Routes (Auth + Admin Role Required)

// Create new category
router.post(
  '/',
  verifyToken,
  checkAdmin,
  [
    body('categoryName')
      .notEmpty().withMessage('Category name is required')
      .isLength({ max: 100 }).withMessage('Category name must not exceed 100 characters'),
    body('categorySlug')
      .notEmpty().withMessage('Category slug is required')
      .matches(/^[a-z0-9-]+$/).withMessage('Category slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('subCategories')
      .optional()
      .isArray().withMessage('Subcategories must be an array'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive must be a boolean'),
    body('displayOrder')
      .optional()
      .isNumeric().withMessage('Display order must be a number'),
    validate
  ],
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  [
    body('categoryName')
      .optional()
      .isLength({ max: 100 }).withMessage('Category name must not exceed 100 characters'),
    body('categorySlug')
      .optional()
      .matches(/^[a-z0-9-]+$/).withMessage('Category slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    body('imageUrl')
      .optional()
      .isURL().withMessage('Image URL must be a valid URL'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive must be a boolean'),
    body('displayOrder')
      .optional()
      .isNumeric().withMessage('Display order must be a number'),
    validate
  ],
  categoryController.updateCategory
);

// Delete category (soft delete by default, permanent with ?permanent=true)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  categoryController.deleteCategory
);

// Subcategory Management Routes

// Add subcategory to a category
router.post(
  '/:categoryId/subcategories',
  verifyToken,
  checkAdmin,
  [
    body('subCategoryName')
      .notEmpty().withMessage('Subcategory name is required')
      .isLength({ max: 100 }).withMessage('Subcategory name must not exceed 100 characters'),
    body('subCategorySlug')
      .notEmpty().withMessage('Subcategory slug is required')
      .matches(/^[a-z0-9-]+$/).withMessage('Subcategory slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    validate
  ],
  categoryController.addSubCategory
);

// Update subcategory
router.put(
  '/:categoryId/subcategories/:subCategoryId',
  verifyToken,
  checkAdmin,
  [
    body('subCategoryName')
      .optional()
      .isLength({ max: 100 }).withMessage('Subcategory name must not exceed 100 characters'),
    body('subCategorySlug')
      .optional()
      .matches(/^[a-z0-9-]+$/).withMessage('Subcategory slug must contain only lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    validate
  ],
  categoryController.updateSubCategory
);

// Remove subcategory from category
router.delete(
  '/:categoryId/subcategories/:subCategoryId',
  verifyToken,
  checkAdmin,
  categoryController.removeSubCategory
);

export default router;
