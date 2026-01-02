import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import categoryController from '../controllers/category.controller.js';
import {
  createCategorySchema,
  updateCategorySchema,
  addSubCategorySchema,
  updateSubCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
  subCategoryParamsSchema,
  getCategoriesQuerySchema,
  getSubCategoriesSchema
} from '../validations/category.validation.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get all categories
router.get(
  '/',
  validate(getCategoriesQuerySchema),
  categoryController.getAllCategories
);

// Get category by slug (must come before /:id to avoid route conflict)
router.get(
  '/slug/:slug',
  validate(categorySlugParamSchema),
  categoryController.getCategoryBySlug
);

// Get category by ID
router.get(
  '/:id',
  validate(categoryIdParamSchema),
  categoryController.getCategoryById
);

// Get subcategories for a category
router.get(
  '/:categoryId/subcategories',
  validate(getSubCategoriesSchema),
  categoryController.getSubCategories
);

// Admin Routes (Auth + Admin Role Required)

// Create new category
router.post(
  '/',
  verifyToken,
  checkAdmin,
  validate(createCategorySchema),
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  validate(categoryIdParamSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

// Delete category (soft delete by default, permanent with ?permanent=true)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  validate(categoryIdParamSchema),
  categoryController.deleteCategory
);

// Subcategory Management Routes

// Add subcategory to a category
router.post(
  '/:categoryId/subcategories',
  verifyToken,
  checkAdmin,
  validate(addSubCategorySchema),
  categoryController.addSubCategory
);

// Update subcategory
router.put(
  '/:categoryId/subcategories/:subCategoryId',
  verifyToken,
  checkAdmin,
  validate(updateSubCategorySchema),
  categoryController.updateSubCategory
);

// Remove subcategory from category
router.delete(
  '/:categoryId/subcategories/:subCategoryId',
  verifyToken,
  checkAdmin,
  validate(subCategoryParamsSchema),
  categoryController.removeSubCategory
);

export default router;
