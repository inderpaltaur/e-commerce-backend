import { db } from '../config/firebase.js';
import {
  buildCategoryPath,
  buildPathIds,
  getChildrenCount
} from '../utils/categoryUtils.js';

/**
 * Migration Script: Convert 2-level category structure to unlimited nesting
 *
 * This script:
 * 1. Adds hierarchy fields (parentId, path, pathIds, level) to all categories
 * 2. Promotes subcategories from subCategories array to top-level category documents
 * 3. Updates parent childrenCount and metadata
 * 4. Preserves backward compatibility by keeping subCategories array (empty)
 *
 * Usage: node backend/src/migrations/migrateCategoryStructure.js
 */

const migrateCategoryStructure = async () => {
  console.log('🚀 Starting category structure migration...\n');

  try {
    // Fetch all existing categories
    const categoriesSnapshot = await db.collection('categories').get();

    if (categoriesSnapshot.empty) {
      console.log('ℹ️  No categories found. Nothing to migrate.');
      return;
    }

    console.log(`📊 Found ${categoriesSnapshot.size} categories to migrate\n`);

    const categories = [];
    categoriesSnapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500;

    let rootCategoriesCount = 0;
    let subCategoriesCreated = 0;

    // Step 1: Process root categories (categories without a parent)
    console.log('📝 Step 1: Migrating root categories...');

    for (const category of categories) {
      // Check if already migrated (has parentId field)
      if (category.parentId !== undefined) {
        console.log(`⏭️  Category "${category.categoryName}" already migrated, skipping...`);
        continue;
      }

      const categoryRef = db.collection('categories').doc(category.id);
      const subCategories = category.subCategories || [];

      // Update root category with hierarchy fields
      const updateData = {
        parentId: null,
        level: 0,
        path: `/${category.categorySlug}`,
        pathIds: [category.id],
        childrenCount: subCategories.length,
        descendantsCount: subCategories.length,
        metadata: {
          hasProducts: false, // Will be updated later
          productCount: 0,
          isLeaf: subCategories.length === 0
        },
        updatedAt: new Date().toISOString()
      };

      batch.update(categoryRef, updateData);
      batchCount++;

      rootCategoriesCount++;
      console.log(`✅ Migrated root category: ${category.categoryName} (${subCategories.length} subcategories)`);

      // Commit batch if limit reached
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`💾 Committed batch of ${batchCount} operations\n`);
        batchCount = 0;
      }
    }

    // Commit remaining root category updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} operations\n`);
      batchCount = 0;
    }

    console.log(`✅ Migrated ${rootCategoriesCount} root categories\n`);

    // Step 2: Create new category documents from subcategories
    console.log('📝 Step 2: Creating subcategory documents...');

    for (const category of categories) {
      const subCategories = category.subCategories || [];

      if (subCategories.length === 0) {
        continue;
      }

      const parentPath = `/${category.categorySlug}`;
      const parentPathIds = [category.id];

      for (const subCat of subCategories) {
        // Create new category document from subcategory
        const newCategoryId = subCat.subCategoryId || `subcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCategoryData = {
          categoryId: newCategoryId,
          categoryName: subCat.subCategoryName,
          categorySlug: subCat.subCategorySlug,
          description: subCat.description || '',
          imageUrl: '',
          parentId: category.id,
          level: 1,
          path: buildCategoryPath(subCat.subCategorySlug, parentPath),
          pathIds: buildPathIds(newCategoryId, parentPathIds),
          displayOrder: 1,
          isActive: true,
          childrenCount: 0,
          descendantsCount: 0,
          subCategories: [], // Empty for new structure
          metadata: {
            hasProducts: false,
            productCount: 0,
            isLeaf: true
          },
          createdAt: subCat.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const newDocRef = db.collection('categories').doc(newCategoryId);
        batch.set(newDocRef, newCategoryData);
        batchCount++;

        subCategoriesCreated++;
        console.log(`  ➕ Created subcategory: ${subCat.subCategoryName} under ${category.categoryName}`);

        // Commit batch if limit reached
        if (batchCount >= MAX_BATCH_SIZE) {
          await batch.commit();
          console.log(`💾 Committed batch of ${batchCount} operations\n`);
          batchCount = 0;
        }
      }
    }

    // Commit remaining subcategory creations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} operations\n`);
    }

    console.log(`✅ Created ${subCategoriesCreated} subcategory documents\n`);

    // Step 3: Clear subCategories arrays from parent categories (keep empty for rollback)
    console.log('📝 Step 3: Clearing legacy subCategories arrays...');

    batchCount = 0;
    let clearedCount = 0;

    for (const category of categories) {
      if (!category.subCategories || category.subCategories.length === 0) {
        continue;
      }

      const categoryRef = db.collection('categories').doc(category.id);
      batch.update(categoryRef, {
        subCategories: [], // Clear but keep the field
        updatedAt: new Date().toISOString()
      });
      batchCount++;
      clearedCount++;

      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Cleared ${clearedCount} legacy subCategories arrays\n`);

    // Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║   CATEGORY MIGRATION COMPLETED! 🎉     ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║ Root categories migrated: ${String(rootCategoriesCount).padEnd(12)}║`);
    console.log(`║ Subcategories created:    ${String(subCategoriesCreated).padEnd(12)}║`);
    console.log(`║ Total categories:         ${String(rootCategoriesCount + subCategoriesCreated).padEnd(12)}║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('\n✅ Migration successful! You can now use unlimited category nesting.\n');
    console.log('⚠️  Note: Run product migration next to update product category references.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCategoryStructure()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateCategoryStructure;
