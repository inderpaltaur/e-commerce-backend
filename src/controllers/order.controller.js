const { db } = require('../config/firebase');

const orderController = {
  // Get all orders (admin only)
  getAllOrders: async (req, res) => {
    try {
      const { limit = 50, status } = req.query;
      let query = db.collection('orders');

      if (status) {
        query = query.where('status', '==', status);
      }

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

  // Get user's orders
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.uid;

      const snapshot = await db
        .collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

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
        message: 'Error fetching user orders',
        error: error.message
      });
    }
  },

  // Get order by ID
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const orderDoc = await db.collection('orders').doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderData = orderDoc.data();

      // Check if user owns this order or is admin
      if (orderData.userId !== userId && !req.user.admin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
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

  // Create order
  createOrder: async (req, res) => {
    try {
      const { items, shippingAddress, paymentMethod } = req.body;
      const userId = req.user.uid;

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const productDoc = await db.collection('products').doc(item.productId).get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found`
          });
        }

        const product = productDoc.data();

        // Check stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          total: itemTotal
        });

        // Update product stock
        await db.collection('products').doc(item.productId).update({
          stock: product.stock - item.quantity
        });
      }

      const orderData = {
        userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('orders').add(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: docRef.id,
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

  // Update order status (admin only)
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await db.collection('orders').doc(id).update({
        status,
        updatedAt: new Date().toISOString()
      });

      const updatedDoc = await db.collection('orders').doc(id).get();

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

  // Cancel order
  cancelOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const orderDoc = await db.collection('orders').doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const orderData = orderDoc.data();

      // Check if user owns this order
      if (orderData.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Only pending orders can be cancelled
      if (orderData.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending orders can be cancelled'
        });
      }

      // Restore product stock
      for (const item of orderData.items) {
        const productDoc = await db.collection('products').doc(item.productId).get();
        if (productDoc.exists) {
          const product = productDoc.data();
          await db.collection('products').doc(item.productId).update({
            stock: product.stock + item.quantity
          });
        }
      }

      await db.collection('orders').doc(id).update({
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error cancelling order',
        error: error.message
      });
    }
  }
};

module.exports = orderController;
