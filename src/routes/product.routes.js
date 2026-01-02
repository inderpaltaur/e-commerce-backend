import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import productController from '../controllers/product.controller.js';
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  updateSoldCountSchema,
  getProductsQuerySchema,
  getProductsByCategorySchema,
  productIdParamSchema
} from '../validations/product.validation.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get featured products (must come before /:id to avoid route conflict)
router.get('/featured', productController.getFeaturedProducts);

// Get trending products (must come before /:id to avoid route conflict)
router.get('/trending', productController.getTrendingProducts);

// Get products by category (must come before /:id)
router.get(
  '/category/:category',
  validate(getProductsByCategorySchema),
  productController.getProductsByCategory
);

// Get all products with filtering and search
router.get(
  '/',
  validate(getProductsQuerySchema),
  productController.getAllProducts
);

// Get single product by ID
router.get(
  '/:id',
  validate(productIdParamSchema),
  productController.getProductById
);

// Admin Routes (Auth + Admin Role Required)

// Create new product
router.post(
  '/',
  verifyToken,
  checkAdmin,
  validate(createProductSchema),
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  validate(productIdParamSchema),
  validate(updateProductSchema),
  productController.updateProduct
);

// Update product stock
router.put(
  '/:id/stock',
  verifyToken,
  checkAdmin,
  validate(productIdParamSchema),
  validate(updateStockSchema),
  productController.updateStock
);

// Update sold count (called when order is completed)
router.put(
  '/:id/sold',
  verifyToken,
  checkAdmin,
  validate(productIdParamSchema),
  validate(updateSoldCountSchema),
  productController.updateSoldCount
);

// Delete product (soft delete by default, permanent with ?permanent=true)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  validate(productIdParamSchema),
  productController.deleteProduct
);

export default router;
