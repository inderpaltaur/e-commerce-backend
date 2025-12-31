import { db } from '../config/firebase.js';

export const categoryController = {
  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const snapshot = await db.collection('categories').get();
      const categories = [];

      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const categoryDoc = await db.collection('categories').doc(id).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: categoryDoc.id,
          ...categoryDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message
      });
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body;

      const categoryData = {
        name,
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('categories').add(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: docRef.id,
          ...categoryData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      await db.collection('categories').doc(id).update(updateData);

      const updatedDoc = await db.collection('categories').doc(id).get();

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if any products use this category
      const productsSnapshot = await db
        .collection('products')
        .where('categoryId', '==', id)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with associated products'
        });
      }

      await db.collection('categories').doc(id).delete();

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message
      });
    }
  }
};

export default categoryController;
