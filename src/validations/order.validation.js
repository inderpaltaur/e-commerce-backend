import { z } from 'zod';

// Address schema
const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  landmark: z.string().optional(),
  addressType: z.enum(['home', 'work', 'other']).default('home').optional()
});

// Color schema for order items
const orderItemColorSchema = z.object({
  colorName: z.string().min(1, 'Color name is required'),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color code')
});

// Order item schema
const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productImage: z.string().url('Product image must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Subcategory is required'),
  productType: z.string().min(1, 'Product type is required'),
  size: z.string().min(1, 'Size is required'),
  color: orderItemColorSchema,
  quantity: z.number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .or(z.string().transform(val => parseInt(val))),
  pricePerUnit: z.number()
    .positive('Price per unit must be positive')
    .or(z.string().transform(val => parseFloat(val))),
  discount: z.number()
    .min(0, 'Discount must be non-negative')
    .or(z.string().transform(val => parseFloat(val)))
    .default(0),
  tax: z.number()
    .min(0, 'Tax must be non-negative')
    .or(z.string().transform(val => parseFloat(val)))
    .default(0),
  totalPrice: z.number()
    .positive('Total price must be positive')
    .or(z.string().transform(val => parseFloat(val))),
  sku: z.string().optional()
});

// Offer applied schema
const offerAppliedSchema = z.object({
  couponCode: z.string().min(1, 'Coupon code is required'),
  discountType: z.enum(['percentage', 'amount', 'free-shipping'], {
    errorMap: () => ({ message: 'Invalid discount type' })
  }),
  discountValue: z.number()
    .min(0, 'Discount value must be non-negative')
    .or(z.string().transform(val => parseFloat(val))),
  discountAmount: z.number()
    .min(0, 'Discount amount must be non-negative')
    .or(z.string().transform(val => parseFloat(val))),
  description: z.string().optional()
});

// Create order schema
export const createOrderSchema = z.object({
  body: z.object({
    orderItems: z.array(orderItemSchema)
      .min(1, 'At least one order item is required'),

    shippingAddress: addressSchema,

    billingAddress: addressSchema.optional(),

    subtotal: z.number()
      .min(0, 'Subtotal must be non-negative')
      .or(z.string().transform(val => parseFloat(val))),

    discount: z.number()
      .min(0, 'Discount must be non-negative')
      .or(z.string().transform(val => parseFloat(val)))
      .default(0),

    tax: z.number()
      .min(0, 'Tax must be non-negative')
      .or(z.string().transform(val => parseFloat(val))),

    deliveryCharges: z.number()
      .min(0, 'Delivery charges must be non-negative')
      .or(z.string().transform(val => parseFloat(val))),

    totalAmount: z.number()
      .positive('Total amount must be positive')
      .or(z.string().transform(val => parseFloat(val))),

    currencyType: z.enum(['INR', 'USD', 'EUR', 'GBP'], {
      errorMap: () => ({ message: 'Invalid currency type' })
    }).default('INR'),

    paymentMethod: z.enum(['cod', 'card', 'upi', 'netbanking', 'wallet', 'emi'], {
      errorMap: () => ({ message: 'Invalid payment method' })
    }),

    offerApplied: offerAppliedSchema.optional(),

    customerNotes: z.string().max(500, 'Customer notes must not exceed 500 characters').optional()
  })
});

// Update order status schema
export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    orderStatus: z.enum([
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
      'failed'
    ], {
      errorMap: () => ({ message: 'Invalid order status' })
    }),

    internalNotes: z.string().max(500, 'Internal notes must not exceed 500 characters').optional()
  })
});

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded', 'partially-refunded'], {
      errorMap: () => ({ message: 'Invalid payment status' })
    }),

    paymentId: z.string().optional(),

    internalNotes: z.string().max(500, 'Internal notes must not exceed 500 characters').optional()
  })
});

// Add tracking info schema
export const addTrackingInfoSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    trackingNumber: z.string().min(1, 'Tracking number is required'),

    courierService: z.string().min(1, 'Courier service is required'),

    estimatedDelivery: z.string()
      .datetime('Invalid date format')
      .optional()
  })
});

// Cancel order schema
export const cancelOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    cancellationReason: z.string()
      .min(1, 'Cancellation reason is required')
      .max(500, 'Cancellation reason must not exceed 500 characters')
  })
});

// Return order schema
export const returnOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    returnReason: z.string()
      .min(1, 'Return reason is required')
      .max(500, 'Return reason must not exceed 500 characters'),

    refundAmount: z.number()
      .positive('Refund amount must be positive')
      .or(z.string().transform(val => parseFloat(val)))
      .optional()
  })
});

// Process refund schema
export const processRefundSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    refundAmount: z.number()
      .positive('Refund amount must be positive')
      .or(z.string().transform(val => parseFloat(val))),

    refundStatus: z.enum(['pending', 'completed', 'rejected'], {
      errorMap: () => ({ message: 'Invalid refund status' })
    }),

    internalNotes: z.string().max(500, 'Internal notes must not exceed 500 characters').optional()
  })
});

// Get user orders query schema
export const getUserOrdersQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    orderStatus: z.enum([
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
      'failed'
    ]).optional(),

    paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded', 'partially-refunded']).optional(),

    fromDate: z.string().datetime('Invalid date format').optional(),

    toDate: z.string().datetime('Invalid date format').optional()
  })
});

// Get all orders query schema (admin)
export const getAllOrdersQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    orderStatus: z.enum([
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded',
      'failed'
    ]).optional(),

    paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded', 'partially-refunded']).optional(),

    paymentMethod: z.enum(['cod', 'card', 'upi', 'netbanking', 'wallet', 'emi']).optional(),

    userId: z.string().optional(),

    fromDate: z.string().datetime('Invalid date format').optional(),

    toDate: z.string().datetime('Invalid date format').optional()
  })
});

// Order ID param schema
export const orderIdParamSchema = z.object({
  params: z.object({
    orderId: z.string().min(1, 'Order ID is required')
  })
});
