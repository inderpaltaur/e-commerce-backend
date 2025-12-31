const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');
const { verifyToken, checkAdmin } = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');

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

module.exports = router;
