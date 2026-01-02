import { db } from '../config/firebase.js';

export const orderController = {
  // Create new order
  createOrder: async (req, res) => {
    try {
      const userId = req.user.uid; // From auth middleware
      const {
        orderItems,
        shippingAddress,
        billingAddress,
        subtotal,
        discount,
        tax,
        deliveryCharges,
        totalAmount,
        currencyType = 'INR',
        paymentMethod,
        offerApplied,
        customerNotes
      } = req.body;

      // Validate stock availability for all items
      for (const item of orderItems) {
        const productDoc = await db.collection('products').doc(item.productId).get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productName} not found`
          });
        }

        const productData = productDoc.data();

        // Check if product is active
        if (!productData.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.productName} is not available`
          });
        }

        // Check overall stock
        if (productData.units < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.productName}. Available: ${productData.units}`
          });
        }

        // Check color-specific stock
        const colorStock = productData.colors.find(c => c.colorName === item.color.colorName);
        if (colorStock && colorStock.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.productName} in ${item.color.colorName}. Available: ${colorStock.stock}`
          });
        }
      }

      // Get user info
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      // Generate order number
      const year = new Date().getFullYear();
      const timestamp = Date.now();
      const orderNumber = `ORD-${year}-${timestamp.toString().slice(-6)}`;

      // Determine payment status (COD is pending, others need gateway confirmation)
      const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'pending';

      // Create order data
      const orderData = {
        orderNumber,
        userId,
        userEmail: userData.email,
        userName: userData.name,
        userPhone: userData.phoneNumber || shippingAddress.phoneNumber,
        orderItems,
        subtotal: parseFloat(subtotal),
        discount: parseFloat(discount),
        tax: parseFloat(tax),
        deliveryCharges: parseFloat(deliveryCharges),
        totalAmount: parseFloat(totalAmount),
        currencyType,
        offerApplied: offerApplied || null,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        orderStatus: 'pending',
        paymentStatus,
        paymentMethod,
        customerNotes: customerNotes || '',
        internalNotes: '',
        refundStatus: 'not-requested',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create order
      const orderRef = await db.collection('orders').add(orderData);

      // Update order with orderId
      await db.collection('orders').doc(orderRef.id).update({
        orderId: orderRef.id
      });

      // Reduce stock for each product (using batch for atomicity)
      const batch = db.batch();

      for (const item of orderItems) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();
        const productData = productDoc.data();

        // Reduce overall units
        const newUnits = productData.units - item.quantity;

        // Reduce color-specific stock
        const updatedColors = productData.colors.map(color => {
          if (color.colorName === item.color.colorName) {
            return { ...color, stock: color.stock - item.quantity };
          }
          return color;
        });

        batch.update(productRef, {
          units: newUnits,
          colors: updatedColors,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: orderRef.id,
          orderNumber,
          ...orderData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message
      });
    }
  },

  // Get user's orders
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.uid;
      const {
        limit = 50,
        orderStatus,
        paymentStatus,
        fromDate,
        toDate
      } = req.query;

      let query = db.collection('orders').where('userId', '==', userId);

      // Apply filters
      if (orderStatus) {
        query = query.where('orderStatus', '==', orderStatus);
      }

      if (paymentStatus) {
        query = query.where('paymentStatus', '==', paymentStatus);
      }

      if (fromDate) {
        query = query.where('createdAt', '>=', fromDate);
      }

      if (toDate) {
        query = query.where('createdAt', '<=', toDate);
      }

      // Sort by creation date (newest first)
      query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

      const snapshot = await query.get();
      const orders = [];

      snapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
      });
    }
  },

  // Get all orders (admin only)
  getAllOrders: async (req, res) => {
    try {
      const {
        limit = 50,
        orderStatus,
        paymentStatus,
        paymentMethod,
        userId,
        fromDate,
        toDate
      } = req.query;

      let query = db.collection('orders');

      // Apply filters
      if (orderStatus) {
        query = query.where('orderStatus', '==', orderStatus);
      }

      if (paymentStatus) {
        query = query.where('paymentStatus', '==', paymentStatus);
      }

      if (paymentMethod) {
        query = query.where('paymentMethod', '==', paymentMethod);
      }

      if (userId) {
        query = query.where('userId', '==', userId);
      }

      if (fromDate) {
        query = query.where('createdAt', '>=', fromDate);
      }

      if (toDate) {
        query = query.where('createdAt', '<=', toDate);
      }

      // Sort by creation date (newest first)
      query = query.orderBy('createdAt', 'desc').limit(parseInt(limit));

      const snapshot = await query.get();
      const orders = [];

      snapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching orders',
        error: error.message
      });
    }
  },

  // Get single order by ID
  getOrderById: async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user.uid;
      const isAdmin = req.user.admin || false;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderData = orderDoc.data();

      // Check if user owns this order or is admin
      if (orderData.userId !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this order'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: orderDoc.id,
          ...orderData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching order',
        error: error.message
      });
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { orderStatus, internalNotes } = req.body;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const updateData = {
        orderStatus,
        updatedAt: new Date().toISOString()
      };

      if (internalNotes) {
        updateData.internalNotes = internalNotes;
      }

      // Add timestamps for specific statuses
      if (orderStatus === 'confirmed') {
        updateData.confirmedAt = new Date().toISOString();
      } else if (orderStatus === 'shipped') {
        updateData.shippedAt = new Date().toISOString();
      } else if (orderStatus === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      } else if (orderStatus === 'cancelled') {
        updateData.cancelledAt = new Date().toISOString();
      }

      await db.collection('orders').doc(orderId).update(updateData);

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating order status',
        error: error.message
      });
    }
  },

  // Update payment status (admin only)
  updatePaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentStatus, paymentId, internalNotes } = req.body;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const updateData = {
        paymentStatus,
        updatedAt: new Date().toISOString()
      };

      if (paymentId) {
        updateData.paymentId = paymentId;
      }

      if (internalNotes) {
        updateData.internalNotes = internalNotes;
      }

      // If payment completed, confirm order
      if (paymentStatus === 'completed') {
        updateData.orderStatus = 'confirmed';
        updateData.confirmedAt = new Date().toISOString();
      }

      await db.collection('orders').doc(orderId).update(updateData);

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating payment status',
        error: error.message
      });
    }
  },

  // Add tracking information (admin only)
  addTrackingInfo: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { trackingNumber, courierService, estimatedDelivery } = req.body;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const updateData = {
        trackingNumber,
        courierService,
        updatedAt: new Date().toISOString()
      };

      if (estimatedDelivery) {
        updateData.estimatedDelivery = estimatedDelivery;
      }

      await db.collection('orders').doc(orderId).update(updateData);

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Tracking information added successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding tracking information',
        error: error.message
      });
    }
  },

  // Cancel order
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { cancellationReason } = req.body;
      const userId = req.user.uid;
      const isAdmin = req.user.admin || false;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderData = orderDoc.data();

      // Check if user owns this order or is admin
      if (orderData.userId !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to cancel this order'
        });
      }

      // Check if order can be cancelled
      const nonCancellableStatuses = ['shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'];
      if (nonCancellableStatuses.includes(orderData.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order with status: ${orderData.orderStatus}`
        });
      }

      // Restore stock for each product
      const batch = db.batch();

      for (const item of orderData.orderItems) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();

        if (productDoc.exists) {
          const productData = productDoc.data();

          // Restore overall units
          const newUnits = productData.units + item.quantity;

          // Restore color-specific stock
          const updatedColors = productData.colors.map(color => {
            if (color.colorName === item.color.colorName) {
              return { ...color, stock: color.stock + item.quantity };
            }
            return color;
          });

          batch.update(productRef, {
            units: newUnits,
            colors: updatedColors,
            updatedAt: new Date().toISOString()
          });
        }
      }

      // Update order status
      const orderRef = db.collection('orders').doc(orderId);
      batch.update(orderRef, {
        orderStatus: 'cancelled',
        cancellationReason,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await batch.commit();

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling order',
        error: error.message
      });
    }
  },

  // Return order
  returnOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { returnReason, refundAmount } = req.body;
      const userId = req.user.uid;
      const isAdmin = req.user.admin || false;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderData = orderDoc.data();

      // Check if user owns this order or is admin
      if (orderData.userId !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to return this order'
        });
      }

      // Check if order can be returned
      if (orderData.orderStatus !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Only delivered orders can be returned'
        });
      }

      // Update order status
      const updateData = {
        orderStatus: 'returned',
        returnReason,
        returnedAt: new Date().toISOString(),
        refundStatus: 'requested',
        updatedAt: new Date().toISOString()
      };

      if (refundAmount) {
        updateData.refundAmount = parseFloat(refundAmount);
      } else {
        updateData.refundAmount = orderData.totalAmount;
      }

      await db.collection('orders').doc(orderId).update(updateData);

      // Restore stock for each product
      const batch = db.batch();

      for (const item of orderData.orderItems) {
        const productRef = db.collection('products').doc(item.productId);
        const productDoc = await productRef.get();

        if (productDoc.exists) {
          const productData = productDoc.data();

          // Restore overall units
          const newUnits = productData.units + item.quantity;

          // Restore color-specific stock
          const updatedColors = productData.colors.map(color => {
            if (color.colorName === item.color.colorName) {
              return { ...color, stock: color.stock + item.quantity };
            }
            return color;
          });

          batch.update(productRef, {
            units: newUnits,
            colors: updatedColors,
            updatedAt: new Date().toISOString()
          });
        }
      }

      await batch.commit();

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Return request submitted successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing return request',
        error: error.message
      });
    }
  },

  // Process refund (admin only)
  processRefund: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { refundAmount, refundStatus, internalNotes } = req.body;

      const orderDoc = await db.collection('orders').doc(orderId).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const updateData = {
        refundAmount: parseFloat(refundAmount),
        refundStatus,
        updatedAt: new Date().toISOString()
      };

      if (internalNotes) {
        updateData.internalNotes = internalNotes;
      }

      if (refundStatus === 'completed') {
        updateData.refundedAt = new Date().toISOString();
        updateData.paymentStatus = 'refunded';
        updateData.orderStatus = 'refunded';
      }

      await db.collection('orders').doc(orderId).update(updateData);

      const updatedDoc = await db.collection('orders').doc(orderId).get();

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing refund',
        error: error.message
      });
    }
  }
};

export default orderController;
