const { db } = require('../config/firebase');

const productController = {
  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const { limit = 50, category, minPrice, maxPrice } = req.query;
      let query = db.collection('products');

      if (category) {
        query = query.where('categoryId', '==', category);
      }

      if (minPrice) {
        query = query.where('price', '>=', parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.where('price', '<=', parseFloat(maxPrice));
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      const products = [];

      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const productDoc = await db.collection('products').doc(id).get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: productDoc.id,
          ...productDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  },

  // Get products by category
  getProductsByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { limit = 50 } = req.query;

      const snapshot = await db
        .collection('products')
        .where('categoryId', '==', categoryId)
        .limit(parseInt(limit))
        .get();

      const products = [];
      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching products by category',
        error: error.message
      });
    }
  },

  // Create product
  createProduct: async (req, res) => {
    try {
      const { name, description, price, categoryId, stock, imageUrl } = req.body;

      const productData = {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        stock: parseInt(stock),
        imageUrl: imageUrl || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('products').add(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: docRef.id,
          ...productData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      if (updateData.stock) {
        updateData.stock = parseInt(updateData.stock);
      }

      await db.collection('products').doc(id).update(updateData);

      const updatedDoc = await db.collection('products').doc(id).get();

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await db.collection('products').doc(id).delete();

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }
};

module.exports = productController;
