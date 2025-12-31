import { db } from '../config/firebase.js';

export const categoryController = {
  // Get all categories with subcategories
  getAllCategories: async (req, res) => {
    try {
      const { isActive } = req.query;

      let query = db.collection('categories');

      // Filter by active status if specified
      if (isActive !== undefined) {
        query = query.where('isActive', '==', isActive === 'true');
      }

      const snapshot = await query.orderBy('displayOrder', 'asc').get();
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

  // Get category by slug
  getCategoryBySlug: async (req, res) => {
    try {
      const { slug } = req.params;

      const snapshot = await db.collection('categories')
        .where('categorySlug', '==', slug)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryDoc = snapshot.docs[0];

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
      const {
        categoryName,
        categorySlug,
        description = '',
        imageUrl = '',
        subCategories = [],
        isActive = true,
        displayOrder = 1
      } = req.body;

      // Validate required fields
      if (!categoryName || !categorySlug) {
        return res.status(400).json({
          success: false,
          message: 'Category name and slug are required'
        });
      }

      // Check if slug already exists
      const existingCategory = await db.collection('categories')
        .where('categorySlug', '==', categorySlug)
        .limit(1)
        .get();

      if (!existingCategory.empty) {
        return res.status(400).json({
          success: false,
          message: 'Category slug already exists'
        });
      }

      const categoryData = {
        categoryName,
        categorySlug,
        description,
        imageUrl,
        subCategories,
        isActive,
        displayOrder: parseInt(displayOrder),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('categories').add(categoryData);

      // Add categoryId to the document
      await db.collection('categories').doc(docRef.id).update({
        categoryId: docRef.id
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: docRef.id,
          categoryId: docRef.id,
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
      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updateData.categoryId;
      delete updateData.createdAt;
      delete updateData.subCategories; // Use separate endpoint for subcategories

      // Set updated timestamp
      updateData.updatedAt = new Date().toISOString();

      // If slug is being updated, check if it already exists
      if (updateData.categorySlug) {
        const existingCategory = await db.collection('categories')
          .where('categorySlug', '==', updateData.categorySlug)
          .limit(1)
          .get();

        if (!existingCategory.empty && existingCategory.docs[0].id !== id) {
          return res.status(400).json({
            success: false,
            message: 'Category slug already exists'
          });
        }
      }

      // Parse displayOrder if provided
      if (updateData.displayOrder !== undefined) {
        updateData.displayOrder = parseInt(updateData.displayOrder);
      }

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
      const { permanent = false } = req.query;

      // Check if any products use this category
      const productsSnapshot = await db
        .collection('products')
        .where('categoryId', '==', id)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with associated products. Please delete or reassign products first.'
        });
      }

      if (permanent === 'true') {
        // Permanent deletion
        await db.collection('categories').doc(id).delete();

        res.status(200).json({
          success: true,
          message: 'Category permanently deleted'
        });
      } else {
        // Soft delete
        await db.collection('categories').doc(id).update({
          isActive: false,
          updatedAt: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message: 'Category deactivated successfully'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message
      });
    }
  },

  // Get all subcategories for a category
  getSubCategories: async (req, res) => {
    try {
      const { categoryId } = req.params;

      const categoryDoc = await db.collection('categories').doc(categoryId).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();
      const subCategories = categoryData.subCategories || [];

      res.status(200).json({
        success: true,
        count: subCategories.length,
        data: subCategories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching subcategories',
        error: error.message
      });
    }
  },

  // Add subcategory to a category
  addSubCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const {
        subCategoryName,
        subCategorySlug,
        description = ''
      } = req.body;

      // Validate required fields
      if (!subCategoryName || !subCategorySlug) {
        return res.status(400).json({
          success: false,
          message: 'Subcategory name and slug are required'
        });
      }

      const categoryDoc = await db.collection('categories').doc(categoryId).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();
      const subCategories = categoryData.subCategories || [];

      // Check if subcategory slug already exists in this category
      const slugExists = subCategories.find(
        sub => sub.subCategorySlug === subCategorySlug
      );

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Subcategory slug already exists in this category'
        });
      }

      // Create new subcategory
      const newSubCategory = {
        subCategoryId: `subcat_${Date.now()}`,
        subCategoryName,
        subCategorySlug,
        description,
        createdAt: new Date().toISOString()
      };

      subCategories.push(newSubCategory);

      await db.collection('categories').doc(categoryId).update({
        subCategories,
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'Subcategory added successfully',
        data: newSubCategory
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding subcategory',
        error: error.message
      });
    }
  },

  // Update subcategory
  updateSubCategory: async (req, res) => {
    try {
      const { categoryId, subCategoryId } = req.params;
      const updateFields = { ...req.body };

      // Remove fields that shouldn't be updated
      delete updateFields.subCategoryId;
      delete updateFields.createdAt;

      const categoryDoc = await db.collection('categories').doc(categoryId).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();
      let subCategories = categoryData.subCategories || [];

      // Find and update the subcategory
      const subCategoryIndex = subCategories.findIndex(
        sub => sub.subCategoryId === subCategoryId
      );

      if (subCategoryIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found'
        });
      }

      // If slug is being updated, check for duplicates
      if (updateFields.subCategorySlug) {
        const slugExists = subCategories.find(
          (sub, index) =>
            sub.subCategorySlug === updateFields.subCategorySlug &&
            index !== subCategoryIndex
        );

        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: 'Subcategory slug already exists in this category'
          });
        }
      }

      // Update the subcategory
      subCategories[subCategoryIndex] = {
        ...subCategories[subCategoryIndex],
        ...updateFields,
        updatedAt: new Date().toISOString()
      };

      await db.collection('categories').doc(categoryId).update({
        subCategories,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Subcategory updated successfully',
        data: subCategories[subCategoryIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating subcategory',
        error: error.message
      });
    }
  },

  // Remove subcategory from category
  removeSubCategory: async (req, res) => {
    try {
      const { categoryId, subCategoryId } = req.params;

      const categoryDoc = await db.collection('categories').doc(categoryId).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();
      const categorySlug = categoryData.categorySlug;
      let subCategories = categoryData.subCategories || [];

      // Find the subcategory to get its slug
      const subCategory = subCategories.find(
        sub => sub.subCategoryId === subCategoryId
      );

      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found'
        });
      }

      // Check if any products use this subcategory
      const productsSnapshot = await db
        .collection('products')
        .where('category', '==', categorySlug)
        .where('subCategory', '==', subCategory.subCategorySlug)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove subcategory with associated products. Please delete or reassign products first.'
        });
      }

      // Remove the subcategory
      subCategories = subCategories.filter(
        sub => sub.subCategoryId !== subCategoryId
      );

      await db.collection('categories').doc(categoryId).update({
        subCategories,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Subcategory removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing subcategory',
        error: error.message
      });
    }
  }
};

export default categoryController;
