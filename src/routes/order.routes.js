const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');
const { verifyToken, checkAdmin } = require('../middleware/auth.middleware');
const orderController = require('../controllers/order.controller');

// Get user orders (authenticated)
router.get('/my-orders', verifyToken, orderController.getUserOrders);

// Get all orders (admin only)
router.get('/', verifyToken, checkAdmin, orderController.getAllOrders);

// Get single order (authenticated)
router.get('/:id', verifyToken, orderController.getOrderById);

// Create order (authenticated)
router.post(
  '/',
  verifyToken,
  [
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    validate
  ],
  orderController.createOrder
);

// Update order status (admin only)
router.put(
  '/:id/status',
  verifyToken,
  checkAdmin,
  [
    body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    validate
  ],
  orderController.updateOrderStatus
);

// Cancel order (authenticated)
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;
