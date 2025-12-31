import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import productController from '../controllers/product.controller.js';

const router = express.Router();

// Get all products (public)
router.get('/', productController.getAllProducts);

// Get single product (public)
router.get('/:id', productController.getProductById);

// Get products by category (public)
router.get('/category/:categoryId', productController.getProductsByCategory);

// Create product (admin only)
router.post(
  '/',
  verifyToken,
  checkAdmin,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('stock').isNumeric().withMessage('Stock must be a number'),
    validate
  ],
  productController.createProduct
);

// Update product (admin only)
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  productController.updateProduct
);

// Delete product (admin only)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  productController.deleteProduct
);

export default router;
