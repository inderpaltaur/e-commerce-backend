import { db, storage as firebaseStorage } from '../config/firebase.js';
import {
  buildCategoryPath,
  buildPathIds,
  validateDepthLimit,
  getChildrenCount,
  updateDescendantPaths,
  getAllDescendants,
  buildCategoryTree,
  getCategoryWithAncestors,
  validateNoCircularReference
} from '../utils/categoryUtils.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, unlinkSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/categories'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

  // Create category (enhanced for unlimited nesting)
  createCategory: async (req, res) => {
    try {
      const {
        categoryName,
        categorySlug,
        description = '',
        imageUrl = '',
        parentId = null,
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

      let parentPath = null;
      let parentPathIds = [];
      let level = 0;

      // If parent is specified, validate and get parent data
      if (parentId) {
        const parentDoc = await db.collection('categories').doc(parentId).get();

        if (!parentDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'Parent category not found'
          });
        }

        const parentData = parentDoc.data();
        parentPath = parentData.path || `/${parentData.categorySlug}`;
        parentPathIds = parentData.pathIds || [parentId];
        level = (parentData.level || 0) + 1;

        // Validate depth limit
        try {
          validateDepthLimit(level);
        } catch (depthError) {
          return res.status(400).json({
            success: false,
            message: depthError.message
          });
        }
      }

      // Check if slug already exists among siblings (same parent)
      let slugQuery = db.collection('categories')
        .where('categorySlug', '==', categorySlug);

      if (parentId) {
        slugQuery = slugQuery.where('parentId', '==', parentId);
      } else {
        slugQuery = slugQuery.where('parentId', '==', null);
      }

      const existingCategory = await slugQuery.limit(1).get();

      if (!existingCategory.empty) {
        return res.status(400).json({
          success: false,
          message: 'Category slug already exists in this parent category'
        });
      }

      // Create the category document first to get the ID
      const tempCategoryData = {
        categoryName,
        categorySlug,
        description,
        imageUrl,
        parentId: parentId || null,
        subCategories,
        isActive,
        displayOrder: parseInt(displayOrder),
        level,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        childrenCount: 0,
        descendantsCount: 0,
        metadata: {
          hasProducts: false,
          productCount: 0,
          isLeaf: true
        }
      };

      const docRef = await db.collection('categories').add(tempCategoryData);

      // Build path and pathIds using the generated ID
      const path = buildCategoryPath(categorySlug, parentPath);
      const pathIds = buildPathIds(docRef.id, parentPathIds);

      // Update the document with path, pathIds, and categoryId
      await db.collection('categories').doc(docRef.id).update({
        categoryId: docRef.id,
        path,
        pathIds
      });

      // If this category has a parent, update parent's childrenCount
      if (parentId) {
        const newChildrenCount = await getChildrenCount(parentId);
        await db.collection('categories').doc(parentId).update({
          childrenCount: newChildrenCount,
          'metadata.isLeaf': false,
          updatedAt: new Date().toISOString()
        });
      }

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: docRef.id,
          categoryId: docRef.id,
          ...tempCategoryData,
          path,
          pathIds
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

  // Update category (enhanced to handle path recalculation)
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Get current category data
      const currentDoc = await db.collection('categories').doc(id).get();

      if (!currentDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const currentData = currentDoc.data();

      // Remove fields that shouldn't be updated directly
      delete updateData.categoryId;
      delete updateData.createdAt;
      delete updateData.subCategories; // Use separate endpoint for subcategories
      delete updateData.parentId; // Use moveCategory endpoint to change parent
      delete updateData.pathIds; // Calculated automatically
      delete updateData.path; // Calculated automatically
      delete updateData.level; // Calculated automatically

      // Set updated timestamp
      updateData.updatedAt = new Date().toISOString();

      // If slug is being updated, check if it already exists among siblings
      if (updateData.categorySlug && updateData.categorySlug !== currentData.categorySlug) {
        let slugQuery = db.collection('categories')
          .where('categorySlug', '==', updateData.categorySlug);

        if (currentData.parentId) {
          slugQuery = slugQuery.where('parentId', '==', currentData.parentId);
        } else {
          slugQuery = slugQuery.where('parentId', '==', null);
        }

        const existingCategory = await slugQuery.limit(1).get();

        if (!existingCategory.empty && existingCategory.docs[0].id !== id) {
          return res.status(400).json({
            success: false,
            message: 'Category slug already exists in this parent category'
          });
        }

        // Recalculate path and update descendants
        const parentPath = currentData.parentId
          ? (await db.collection('categories').doc(currentData.parentId).get()).data()?.path || ''
          : '';

        const newPath = buildCategoryPath(updateData.categorySlug, parentPath);
        const newPathIds = currentData.pathIds || [id];

        updateData.path = newPath;

        // Update all descendants' paths
        await updateDescendantPaths(id, newPath, newPathIds);
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

  // Delete category (enhanced to check for children and descendants)
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { permanent = false, cascade = false } = req.query;

      // Get the category data
      const categoryDoc = await db.collection('categories').doc(id).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();

      // Check if category has children
      const childrenSnapshot = await db
        .collection('categories')
        .where('parentId', '==', id)
        .limit(1)
        .get();

      if (!childrenSnapshot.empty && cascade !== 'true') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with children. Use cascade=true to delete all descendants, or reassign children first.'
        });
      }

      // Get all descendants if cascade delete
      const descendantsToDelete = cascade === 'true' ? await getAllDescendants(id) : [];

      // Check if any products use this category or any descendants
      const categoriesToCheck = [id, ...descendantsToDelete.map(d => d.id)];

      // Check if any products reference these categories via categoryPathIds
      let hasProducts = false;

      for (const catId of categoriesToCheck) {
        const productsSnapshot = await db
          .collection('products')
          .where('categoryPathIds', 'array-contains', catId)
          .limit(1)
          .get();

        if (!productsSnapshot.empty) {
          hasProducts = true;
          break;
        }

        // Also check old categoryId field for backward compatibility
        const oldProductsSnapshot = await db
          .collection('products')
          .where('categoryId', '==', catId)
          .limit(1)
          .get();

        if (!oldProductsSnapshot.empty) {
          hasProducts = true;
          break;
        }
      }

      if (hasProducts) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with associated products. Please delete or reassign products first.'
        });
      }

      if (permanent === 'true') {
        // Permanent deletion
        const batch = db.batch();

        // Delete the category itself
        batch.delete(db.collection('categories').doc(id));

        // Delete all descendants if cascade
        if (cascade === 'true') {
          descendantsToDelete.forEach(descendant => {
            batch.delete(db.collection('categories').doc(descendant.id));
          });
        }

        await batch.commit();

        // Update parent's childrenCount if this category had a parent
        if (categoryData.parentId) {
          const newChildrenCount = await getChildrenCount(categoryData.parentId);
          const isLeaf = newChildrenCount === 0;

          await db.collection('categories').doc(categoryData.parentId).update({
            childrenCount: newChildrenCount,
            'metadata.isLeaf': isLeaf,
            updatedAt: new Date().toISOString()
          });
        }

        res.status(200).json({
          success: true,
          message: cascade === 'true'
            ? `Category and ${descendantsToDelete.length} descendants permanently deleted`
            : 'Category permanently deleted',
          deletedCount: cascade === 'true' ? descendantsToDelete.length + 1 : 1
        });
      } else {
        // Soft delete
        const batch = db.batch();
        const categoryRef = db.collection('categories').doc(id);

        batch.update(categoryRef, {
          isActive: false,
          updatedAt: new Date().toISOString()
        });

        // Soft delete all descendants if cascade
        if (cascade === 'true') {
          descendantsToDelete.forEach(descendant => {
            batch.update(db.collection('categories').doc(descendant.id), {
              isActive: false,
              updatedAt: new Date().toISOString()
            });
          });
        }

        await batch.commit();

        res.status(200).json({
          success: true,
          message: cascade === 'true'
            ? `Category and ${descendantsToDelete.length} descendants deactivated successfully`
            : 'Category deactivated successfully',
          deactivatedCount: cascade === 'true' ? descendantsToDelete.length + 1 : 1
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
  },

  // NEW HIERARCHY METHODS

  // Get category tree (nested hierarchy)
  getCategoryTree: async (req, res) => {
    try {
      const { maxDepth, parentId, includeInactive } = req.query;

      let query = db.collection('categories');

      // Filter by active status if not explicitly including inactive
      if (includeInactive !== true && includeInactive !== 'true') {
        query = query.where('isActive', '==', true);
      }

      const snapshot = await query.get();
      const categories = [];

      snapshot.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Build tree structure
      const tree = buildCategoryTree(
        categories,
        parentId || null,
        maxDepth ? parseInt(maxDepth) : Infinity
      );

      res.status(200).json({
        success: true,
        count: tree.length,
        data: tree
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category tree',
        error: error.message
      });
    }
  },

  // Get direct children of a category
  getCategoryChildren: async (req, res) => {
    try {
      const { id } = req.params;

      const childrenSnapshot = await db
        .collection('categories')
        .where('parentId', '==', id)
        .orderBy('displayOrder', 'asc')
        .get();

      const children = [];

      childrenSnapshot.forEach(doc => {
        children.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: children.length,
        data: children
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category children',
        error: error.message
      });
    }
  },

  // Get all descendants of a category
  getCategoryDescendants: async (req, res) => {
    try {
      const { id } = req.params;

      const descendants = await getAllDescendants(id);

      res.status(200).json({
        success: true,
        count: descendants.length,
        data: descendants
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category descendants',
        error: error.message
      });
    }
  },

  // Get category with ancestors (breadcrumb)
  getCategoryAncestors: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await getCategoryWithAncestors(id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category ancestors',
        error: error.message
      });
    }
  },

  // Move category to a new parent
  moveCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { newParentId, newDisplayOrder } = req.body;

      // Get current category
      const categoryDoc = await db.collection('categories').doc(id).get();

      if (!categoryDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const categoryData = categoryDoc.data();

      // Validate no circular reference
      try {
        await validateNoCircularReference(id, newParentId);
      } catch (circularError) {
        return res.status(400).json({
          success: false,
          message: circularError.message
        });
      }

      // Get new parent data
      let newParentPath = '';
      let newParentPathIds = [];
      let newLevel = 0;

      if (newParentId) {
        const newParentDoc = await db.collection('categories').doc(newParentId).get();

        if (!newParentDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'New parent category not found'
          });
        }

        const newParentData = newParentDoc.data();
        newParentPath = newParentData.path || `/${newParentData.categorySlug}`;
        newParentPathIds = newParentData.pathIds || [newParentId];
        newLevel = (newParentData.level || 0) + 1;
      }

      // Build new path and pathIds
      const newPath = buildCategoryPath(categoryData.categorySlug, newParentPath);
      const newPathIds = buildPathIds(id, newParentPathIds);

      // Update category
      const updateData = {
        parentId: newParentId || null,
        path: newPath,
        pathIds: newPathIds,
        level: newLevel,
        updatedAt: new Date().toISOString()
      };

      if (newDisplayOrder !== undefined) {
        updateData.displayOrder = parseInt(newDisplayOrder);
      }

      await db.collection('categories').doc(id).update(updateData);

      // Update all descendants' paths
      await updateDescendantPaths(id, newPath, newPathIds);

      // Update old parent's childrenCount
      if (categoryData.parentId) {
        const oldParentChildrenCount = await getChildrenCount(categoryData.parentId);
        await db.collection('categories').doc(categoryData.parentId).update({
          childrenCount: oldParentChildrenCount,
          'metadata.isLeaf': oldParentChildrenCount === 0,
          updatedAt: new Date().toISOString()
        });
      }

      // Update new parent's childrenCount
      if (newParentId) {
        const newParentChildrenCount = await getChildrenCount(newParentId);
        await db.collection('categories').doc(newParentId).update({
          childrenCount: newParentChildrenCount,
          'metadata.isLeaf': false,
          updatedAt: new Date().toISOString()
        });
      }

      // Get updated category
      const updatedDoc = await db.collection('categories').doc(id).get();

      res.status(200).json({
        success: true,
        message: 'Category moved successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error moving category',
        error: error.message
      });
    }
  },

  // Reorder multiple categories
  reorderCategories: async (req, res) => {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const batch = db.batch();

      for (const update of updates) {
        const { id, displayOrder } = update;

        if (!id || displayOrder === undefined) {
          continue;
        }

        const categoryRef = db.collection('categories').doc(id);
        batch.update(categoryRef, {
          displayOrder: parseInt(displayOrder),
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();

      res.status(200).json({
        success: true,
        message: `${updates.length} categories reordered successfully`,
        updatedCount: updates.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error reordering categories',
        error: error.message
      });
    }
  },

  // Get categories by level
  getCategoriesByLevel: async (req, res) => {
    try {
      const { level } = req.params;
      const levelNum = parseInt(level);

      if (isNaN(levelNum) || levelNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Level must be a non-negative integer'
        });
      }

      const snapshot = await db
        .collection('categories')
        .where('level', '==', levelNum)
        .orderBy('displayOrder', 'asc')
        .get();

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
        level: levelNum,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories by level',
        error: error.message
      });
    }
  },

  // Upload category image
  uploadCategoryImage: [
    upload.single('image'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No image file provided'
          });
        }

        // Upload to Firebase Storage
        const bucket = firebaseStorage.bucket();
        const fileName = `categories/${Date.now()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        // Read the uploaded file
        const fileContent = readFileSync(req.file.path);

        // Upload to Firebase Storage
        await file.save(fileContent, {
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        // Get a signed URL with long expiry (10 years)
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        });

        // Clean up the local file
        unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully to Firebase Storage',
          imageUrl: url
        });
      } catch (error) {
        console.error('Firebase Storage upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Error uploading image to Firebase Storage. Please ensure Cloud Storage is enabled in your Firebase Console.',
          error: error.message
        });
      }
    }
  ]
};

export default categoryController;
