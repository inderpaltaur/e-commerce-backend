import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import productController from '../controllers/product.controller.js';

const router = express.Router();

// Public Routes (No Auth Required)

// Get featured products (must come before /:id to avoid route conflict)
router.get('/featured', productController.getFeaturedProducts);

// Get trending products (must come before /:id to avoid route conflict)
router.get('/trending', productController.getTrendingProducts);

// Get products by category (must come before /:id)
router.get('/category/:category', productController.getProductsByCategory);

// Get all products with filtering and search
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

// Admin Routes (Auth + Admin Role Required)

// Create new product
router.post(
  '/',
  verifyToken,
  checkAdmin,
  [
    body('productName')
      .notEmpty().withMessage('Product name is required')
      .isLength({ max: 200 }).withMessage('Product name must not exceed 200 characters'),
    body('productDescription')
      .notEmpty().withMessage('Product description is required')
      .isLength({ max: 2000 }).withMessage('Product description must not exceed 2000 characters'),
    body('category')
      .notEmpty().withMessage('Category is required')
      .isIn(['men', 'women', 'kids', 'unisex']).withMessage('Invalid category'),
    body('subCategory')
      .notEmpty().withMessage('Sub-category is required'),
    body('productType')
      .notEmpty().withMessage('Product type is required'),
    body('price')
      .isNumeric().withMessage('Price must be a number')
      .isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('currencyType')
      .optional()
      .isIn(['INR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency type'),
    body('offerType')
      .optional()
      .isIn(['percentage', 'amount', 'none']).withMessage('Invalid offer type'),
    body('offerValue')
      .optional()
      .isNumeric().withMessage('Offer value must be a number'),
    body('tax')
      .optional()
      .isNumeric().withMessage('Tax must be a number')
      .isFloat({ min: 0, max: 100 }).withMessage('Tax must be between 0 and 100'),
    body('sizes')
      .isArray({ min: 1 }).withMessage('At least one size is required'),
    body('colors')
      .isArray({ min: 1 }).withMessage('At least one color is required'),
    body('colors.*.colorName')
      .notEmpty().withMessage('Color name is required'),
    body('colors.*.colorCode')
      .notEmpty().withMessage('Color code is required'),
    body('colors.*.stock')
      .isNumeric().withMessage('Color stock must be a number')
      .isInt({ min: 0 }).withMessage('Color stock must be non-negative'),
    body('images')
      .isArray({ min: 1 }).withMessage('At least one product image is required'),
    body('units')
      .isNumeric().withMessage('Units must be a number')
      .isInt({ min: 0 }).withMessage('Units must be non-negative'),
    body('brand')
      .optional(),
    body('material')
      .optional(),
    body('weight')
      .optional()
      .isNumeric().withMessage('Weight must be a number'),
    body('sku')
      .optional(),
    body('vendor')
      .optional(),
    body('countryOfOrigin')
      .optional(),
    body('isFeatured')
      .optional()
      .isBoolean().withMessage('isFeatured must be a boolean'),
    validate
  ],
  productController.createProduct
);

// Update product
router.put(
  '/:id',
  verifyToken,
  checkAdmin,
  [
    body('productName')
      .optional()
      .isLength({ max: 200 }).withMessage('Product name must not exceed 200 characters'),
    body('productDescription')
      .optional()
      .isLength({ max: 2000 }).withMessage('Product description must not exceed 2000 characters'),
    body('category')
      .optional()
      .isIn(['men', 'women', 'kids', 'unisex']).withMessage('Invalid category'),
    body('price')
      .optional()
      .isNumeric().withMessage('Price must be a number')
      .isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('offerType')
      .optional()
      .isIn(['percentage', 'amount', 'none']).withMessage('Invalid offer type'),
    body('offerValue')
      .optional()
      .isNumeric().withMessage('Offer value must be a number'),
    body('tax')
      .optional()
      .isNumeric().withMessage('Tax must be a number')
      .isFloat({ min: 0, max: 100 }).withMessage('Tax must be between 0 and 100'),
    body('units')
      .optional()
      .isNumeric().withMessage('Units must be a number')
      .isInt({ min: 0 }).withMessage('Units must be non-negative'),
    body('isFeatured')
      .optional()
      .isBoolean().withMessage('isFeatured must be a boolean'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive must be a boolean'),
    validate
  ],
  productController.updateProduct
);

// Update product stock
router.put(
  '/:id/stock',
  verifyToken,
  checkAdmin,
  [
    body('units')
      .optional()
      .isNumeric().withMessage('Units must be a number')
      .isInt({ min: 0 }).withMessage('Units must be non-negative'),
    body('colorStock')
      .optional()
      .isArray().withMessage('Color stock must be an array'),
    body('colorStock.*.colorName')
      .optional()
      .notEmpty().withMessage('Color name is required'),
    body('colorStock.*.stock')
      .optional()
      .isNumeric().withMessage('Stock must be a number')
      .isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    validate
  ],
  productController.updateStock
);

// Update sold count (called when order is completed)
router.put(
  '/:id/sold',
  verifyToken,
  checkAdmin,
  [
    body('quantity')
      .notEmpty().withMessage('Quantity is required')
      .isNumeric().withMessage('Quantity must be a number')
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate
  ],
  productController.updateSoldCount
);

// Delete product (soft delete by default, permanent with ?permanent=true)
router.delete(
  '/:id',
  verifyToken,
  checkAdmin,
  productController.deleteProduct
);

export default router;
