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
  getSubCategoriesSchema,
  getCategoryTreeSchema,
  moveCategorySchema,
  reorderCategoriesSchema,
  getCategoriesByLevelSchema
} from '../validations/category.validation.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get all categories
router.get(
  '/',
  validate(getCategoriesQuerySchema),
  categoryController.getAllCategories
);

// NEW: Get category tree (hierarchical structure)
router.get(
  '/tree',
  validate(getCategoryTreeSchema),
  categoryController.getCategoryTree
);

// NEW: Get categories by level
router.get(
  '/level/:level',
  validate(getCategoriesByLevelSchema),
  categoryController.getCategoriesByLevel
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

// NEW: Get category children (direct children only)
router.get(
  '/:id/children',
  validate(categoryIdParamSchema),
  categoryController.getCategoryChildren
);

// NEW: Get category descendants (all nested children)
router.get(
  '/:id/descendants',
  validate(categoryIdParamSchema),
  categoryController.getCategoryDescendants
);

// NEW: Get category ancestors (breadcrumb)
router.get(
  '/:id/ancestors',
  validate(categoryIdParamSchema),
  categoryController.getCategoryAncestors
);

// Get subcategories for a category (DEPRECATED - use /tree or /:id/children instead)
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

// NEW: Move category to new parent (Admin Only)
router.put(
  '/:id/move',
  verifyToken,
  checkAdmin,
  validate(moveCategorySchema),
  categoryController.moveCategory
);

// NEW: Bulk reorder categories (Admin Only)
router.put(
  '/reorder',
  verifyToken,
  checkAdmin,
  validate(reorderCategoriesSchema),
  categoryController.reorderCategories
);

// Upload category image
router.post(
  '/upload-image',
  verifyToken,
  checkAdmin,
  ...categoryController.uploadCategoryImage
);

// Subcategory Management Routes (DEPRECATED - use create with parentId instead)

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
