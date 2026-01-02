import express from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { verifyToken, checkAdmin } from '../middleware/auth.middleware.js';
import orderController from '../controllers/order.controller.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  addTrackingInfoSchema,
  cancelOrderSchema,
  returnOrderSchema,
  processRefundSchema,
  getUserOrdersQuerySchema,
  getAllOrdersQuerySchema,
  orderIdParamSchema
} from '../validations/order.validation.js';

const router = express.Router();

// ===== User Order Routes =====
// Get user's orders (authenticated)
router.get(
  '/my-orders',
  verifyToken,
  validate(getUserOrdersQuerySchema),
  orderController.getUserOrders
);

// Get single order by ID (authenticated)
router.get(
  '/:orderId',
  verifyToken,
  validate(orderIdParamSchema),
  orderController.getOrderById
);

// Create new order (authenticated)
router.post(
  '/',
  verifyToken,
  validate(createOrderSchema),
  orderController.createOrder
);

// Cancel order (authenticated)
router.post(
  '/:orderId/cancel',
  verifyToken,
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

// Return order (authenticated)
router.post(
  '/:orderId/return',
  verifyToken,
  validate(returnOrderSchema),
  orderController.returnOrder
);

// ===== Admin Order Routes =====
// Get all orders (admin only)
router.get(
  '/',
  verifyToken,
  checkAdmin,
  validate(getAllOrdersQuerySchema),
  orderController.getAllOrders
);

// Update order status (admin only)
router.put(
  '/:orderId/status',
  verifyToken,
  checkAdmin,
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Update payment status (admin only)
router.put(
  '/:orderId/payment',
  verifyToken,
  checkAdmin,
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus
);

// Add tracking information (admin only)
router.put(
  '/:orderId/tracking',
  verifyToken,
  checkAdmin,
  validate(addTrackingInfoSchema),
  orderController.addTrackingInfo
);

// Process refund (admin only)
router.put(
  '/:orderId/refund',
  verifyToken,
  checkAdmin,
  validate(processRefundSchema),
  orderController.processRefund
);

export default router;
