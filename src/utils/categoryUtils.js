import { db } from '../config/firebase.js';

/**
 * Build category path from parent path and current slug
 * @param {string} categorySlug - Current category slug
 * @param {string|null} parentPath - Parent category path (null for root)
 * @returns {string} Full path (e.g., "/electronics/computers/laptops")
 */
export const buildCategoryPath = (categorySlug, parentPath) => {
  if (!parentPath || parentPath === '') {
    return `/${categorySlug}`;
  }
  return `${parentPath}/${categorySlug}`;
};

/**
 * Build pathIds array from parent pathIds and current category ID
 * @param {string} categoryId - Current category ID
 * @param {string[]|null} parentPathIds - Parent category pathIds array
 * @returns {string[]} Array of all ancestor IDs plus current ID
 */
export const buildPathIds = (categoryId, parentPathIds) => {
  if (!parentPathIds || parentPathIds.length === 0) {
    return [categoryId];
  }
  return [...parentPathIds, categoryId];
};

/**
 * Validate that moving a category won't create circular reference
 * @param {string} categoryId - Category being moved
 * @param {string|null} newParentId - New parent category ID
 * @returns {Promise<boolean>} True if valid (no circular reference)
 * @throws {Error} If circular reference detected
 */
export const validateNoCircularReference = async (categoryId, newParentId) => {
  if (!newParentId) {
    return true; // Moving to root is always valid
  }

  if (categoryId === newParentId) {
    throw new Error('Cannot set category as its own parent');
  }

  // Get the new parent category
  const parentDoc = await db.collection('categories').doc(newParentId).get();

  if (!parentDoc.exists) {
    throw new Error('Parent category not found');
  }

  const parentData = parentDoc.data();

  // Check if the new parent is a descendant of the category being moved
  if (parentData.pathIds && parentData.pathIds.includes(categoryId)) {
    throw new Error('Cannot move category to its own descendant');
  }

  return true;
};

/**
 * Build hierarchical tree structure from flat category list
 * @param {Array} categories - Flat array of category objects
 * @param {string|null} parentId - Parent ID to filter by (null for root)
 * @param {number} maxDepth - Maximum depth to build (default: Infinity)
 * @param {number} currentDepth - Current depth in recursion
 * @returns {Array} Nested tree structure
 */
export const buildCategoryTree = (
  categories,
  parentId = null,
  maxDepth = Infinity,
  currentDepth = 0
) => {
  if (currentDepth >= maxDepth) {
    return [];
  }

  // Filter categories by parent ID
  const children = categories.filter(cat => {
    if (parentId === null) {
      return cat.parentId === null || cat.parentId === undefined;
    }
    return cat.parentId === parentId;
  });

  // Sort by displayOrder
  children.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Recursively build children for each category
  return children.map(category => ({
    ...category,
    children: buildCategoryTree(
      categories,
      category.id || category.categoryId,
      maxDepth,
      currentDepth + 1
    )
  }));
};

/**
 * Update paths for all descendants when parent path changes
 * @param {string} categoryId - Category whose descendants need updating
 * @param {string} newPath - New path for the category
 * @param {string[]} newPathIds - New pathIds for the category
 * @returns {Promise<number>} Number of descendants updated
 */
export const updateDescendantPaths = async (categoryId, newPath, newPathIds) => {
  try {
    // Get all descendants (categories where pathIds contains categoryId)
    const descendantsSnapshot = await db
      .collection('categories')
      .where('pathIds', 'array-contains', categoryId)
      .get();

    if (descendantsSnapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    let updateCount = 0;
    const MAX_BATCH_SIZE = 500;

    for (const doc of descendantsSnapshot.docs) {
      const descendant = doc.data();

      // Skip the category itself
      if (doc.id === categoryId) {
        continue;
      }

      // Find where the category appears in the descendant's pathIds
      const categoryIndex = descendant.pathIds.indexOf(categoryId);

      if (categoryIndex === -1) {
        continue; // This shouldn't happen, but skip if it does
      }

      // Build new pathIds: newPathIds + remaining pathIds after categoryId
      const updatedPathIds = [
        ...newPathIds,
        ...descendant.pathIds.slice(categoryIndex + 1)
      ];

      // Build new path by replacing the old path prefix with new path
      const oldPathPrefix = descendant.pathIds
        .slice(0, categoryIndex + 1)
        .map(id => {
          const cat = descendantsSnapshot.docs.find(d => d.id === id)?.data();
          return cat?.categorySlug;
        })
        .filter(Boolean)
        .join('/');

      // Calculate the new path
      const pathSuffix = descendant.path.substring(descendant.path.indexOf(descendant.categorySlug));
      const updatedPath = `${newPath}/${pathSuffix.substring(descendant.categorySlug.length + 1) || descendant.categorySlug}`;

      // Calculate new level
      const updatedLevel = updatedPathIds.length - 1;

      batch.update(doc.ref, {
        path: updatedPath,
        pathIds: updatedPathIds,
        level: updatedLevel,
        updatedAt: new Date().toISOString()
      });

      updateCount++;

      // Commit batch if we've reached max size
      if (updateCount % MAX_BATCH_SIZE === 0) {
        await batch.commit();
      }
    }

    // Commit remaining updates
    if (updateCount % MAX_BATCH_SIZE !== 0) {
      await batch.commit();
    }

    return updateCount;
  } catch (error) {
    console.error('Error updating descendant paths:', error);
    throw error;
  }
};

/**
 * Get category with all its ancestors
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Object with category and ancestors array
 */
export const getCategoryWithAncestors = async (categoryId) => {
  try {
    const categoryDoc = await db.collection('categories').doc(categoryId).get();

    if (!categoryDoc.exists) {
      throw new Error('Category not found');
    }

    const category = { id: categoryDoc.id, ...categoryDoc.data() };
    const ancestors = [];

    // If category has pathIds, fetch all ancestors
    if (category.pathIds && category.pathIds.length > 0) {
      // Get all ancestor IDs (exclude the category itself)
      const ancestorIds = category.pathIds.slice(0, -1);

      if (ancestorIds.length > 0) {
        const ancestorDocs = await Promise.all(
          ancestorIds.map(id => db.collection('categories').doc(id).get())
        );

        ancestorDocs.forEach(doc => {
          if (doc.exists) {
            ancestors.push({ id: doc.id, ...doc.data() });
          }
        });
      }
    }

    return {
      category,
      ancestors,
      breadcrumb: [...ancestors, category]
    };
  } catch (error) {
    console.error('Error getting category with ancestors:', error);
    throw error;
  }
};

/**
 * Calculate children count for a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<number>} Number of direct children
 */
export const getChildrenCount = async (categoryId) => {
  const childrenSnapshot = await db
    .collection('categories')
    .where('parentId', '==', categoryId)
    .get();

  return childrenSnapshot.size;
};

/**
 * Calculate descendants count for a category (all nested children)
 * @param {string} categoryId - Category ID
 * @returns {Promise<number>} Number of all descendants
 */
export const getDescendantsCount = async (categoryId) => {
  const descendantsSnapshot = await db
    .collection('categories')
    .where('pathIds', 'array-contains', categoryId)
    .get();

  // Subtract 1 to exclude the category itself
  return Math.max(0, descendantsSnapshot.size - 1);
};

/**
 * Get all descendants of a category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Array of descendant categories
 */
export const getAllDescendants = async (categoryId) => {
  try {
    const descendantsSnapshot = await db
      .collection('categories')
      .where('pathIds', 'array-contains', categoryId)
      .get();

    const descendants = [];

    descendantsSnapshot.forEach(doc => {
      // Exclude the category itself
      if (doc.id !== categoryId) {
        descendants.push({ id: doc.id, ...doc.data() });
      }
    });

    // Sort by level and displayOrder
    descendants.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

    return descendants;
  } catch (error) {
    console.error('Error getting descendants:', error);
    throw error;
  }
};

/**
 * Validate category depth limit
 * @param {number} level - Proposed level for category
 * @param {number} maxDepth - Maximum allowed depth (default: 10)
 * @returns {boolean} True if within limit
 * @throws {Error} If depth limit exceeded
 */
export const validateDepthLimit = (level, maxDepth = 10) => {
  if (level >= maxDepth) {
    throw new Error(`Maximum category depth of ${maxDepth} levels exceeded`);
  }
  return true;
};

export default {
  buildCategoryPath,
  buildPathIds,
  validateNoCircularReference,
  buildCategoryTree,
  updateDescendantPaths,
  getCategoryWithAncestors,
  getChildrenCount,
  getDescendantsCount,
  getAllDescendants,
  validateDepthLimit
};
