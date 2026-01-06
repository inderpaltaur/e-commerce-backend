import { db } from '../config/firebase.js';

/**
 * Migration Script: Update products to use dynamic category references
 *
 * This script:
 * 1. Maps old category/subCategory strings to new categoryId references
 * 2. Populates categoryPath and categoryPathIds fields
 * 3. Keeps old category/subCategory fields for backward compatibility
 * 4. Updates product counts in category metadata
 *
 * Usage: node backend/src/migrations/migrateProductCategories.js
 */

const migrateProductCategories = async () => {
  console.log('🚀 Starting product category migration...\n');

  try {
    // Step 1: Build category lookup maps
    console.log('📝 Step 1: Building category lookup maps...');

    const categoriesSnapshot = await db.collection('categories').get();

    if (categoriesSnapshot.empty) {
      console.log('⚠️  No categories found. Please run category migration first.');
      return;
    }

    // Build maps for quick lookup
    const categoryBySlug = new Map(); // categorySlug -> category data
    const categoryByNameAndParent = new Map(); // "parentSlug:subCategoryName" -> category data

    categoriesSnapshot.forEach(doc => {
      const categoryData = { id: doc.id, ...doc.data() };
      const slug = categoryData.categorySlug;

      // Map by slug for root categories
      categoryBySlug.set(slug, categoryData);

      // Map by parent+name for subcategories
      if (categoryData.parentId) {
        const parentDoc = categoriesSnapshot.docs.find(d => d.id === categoryData.parentId);
        if (parentDoc) {
          const parentSlug = parentDoc.data().categorySlug;
          const key = `${parentSlug}:${categoryData.categoryName}`.toLowerCase();
          categoryByNameAndParent.set(key, categoryData);
        }
      }
    });

    console.log(`✅ Built lookup maps for ${categoryBySlug.size} categories\n`);

    // Step 2: Migrate products
    console.log('📝 Step 2: Migrating products...');

    const productsSnapshot = await db.collection('products').get();

    if (productsSnapshot.empty) {
      console.log('ℹ️  No products found. Nothing to migrate.');
      return;
    }

    console.log(`📊 Found ${productsSnapshot.size} products to migrate\n`);

    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500;

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data();
      const productId = productDoc.id;

      // Skip if already migrated (has categoryId)
      if (product.categoryId) {
        console.log(`⏭️  Product "${product.productName}" already migrated, skipping...`);
        skippedCount++;
        continue;
      }

      // Check if product has old category fields
      if (!product.category) {
        console.log(`⚠️  Product "${product.productName}" has no category field, skipping...`);
        skippedCount++;
        continue;
      }

      let categoryMatch = null;

      // Try to find matching category
      // First, try to find by parent category slug + subcategory name
      if (product.subCategory) {
        const lookupKey = `${product.category}:${product.subCategory}`.toLowerCase();
        categoryMatch = categoryByNameAndParent.get(lookupKey);

        // If not found, try by subcategory slug
        if (!categoryMatch) {
          categoryMatch = categoryBySlug.get(product.subCategory);
        }
      }

      // If still not found, try root category by slug
      if (!categoryMatch) {
        categoryMatch = categoryBySlug.get(product.category);
      }

      if (!categoryMatch) {
        console.log(`❌ Could not find category for product "${product.productName}" (category: ${product.category}, subCategory: ${product.subCategory || 'none'})`);
        errorCount++;
        continue;
      }

      // Update product with new category fields
      const updateData = {
        categoryId: categoryMatch.id,
        categoryPath: categoryMatch.path || `/${categoryMatch.categorySlug}`,
        categoryPathIds: categoryMatch.pathIds || [categoryMatch.id],
        updatedAt: new Date().toISOString()
        // Keep old category and subCategory fields for backward compatibility
      };

      batch.update(productDoc.ref, updateData);
      batchCount++;
      migratedCount++;

      console.log(`✅ Migrated product: ${product.productName} -> ${categoryMatch.categoryName}`);

      // Commit batch if limit reached
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(`💾 Committed batch of ${batchCount} operations\n`);
        batchCount = 0;
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`💾 Committed final batch of ${batchCount} operations\n`);
    }

    console.log(`✅ Migrated ${migratedCount} products\n`);

    // Step 3: Update category product counts
    console.log('📝 Step 3: Updating category product counts...');

    batchCount = 0;
    const categoryProductCounts = new Map();

    // Count products for each category
    const updatedProductsSnapshot = await db.collection('products')
      .where('isActive', '==', true)
      .get();

    updatedProductsSnapshot.forEach(doc => {
      const product = doc.data();
      if (product.categoryPathIds && Array.isArray(product.categoryPathIds)) {
        // Increment count for all categories in the path
        product.categoryPathIds.forEach(catId => {
          categoryProductCounts.set(catId, (categoryProductCounts.get(catId) || 0) + 1);
        });
      }
    });

    // Update category metadata
    for (const [categoryId, productCount] of categoryProductCounts.entries()) {
      const categoryRef = db.collection('categories').doc(categoryId);
      batch.update(categoryRef, {
        'metadata.productCount': productCount,
        'metadata.hasProducts': productCount > 0,
        updatedAt: new Date().toISOString()
      });
      batchCount++;

      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Updated product counts for ${categoryProductCounts.size} categories\n`);

    // Summary
    console.log('╔════════════════════════════════════════╗');
    console.log('║   PRODUCT MIGRATION COMPLETED! 🎉      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║ Products migrated:   ${String(migratedCount).padEnd(17)}║`);
    console.log(`║ Products skipped:    ${String(skippedCount).padEnd(17)}║`);
    console.log(`║ Errors encountered:  ${String(errorCount).padEnd(17)}║`);
    console.log(`║ Categories updated:  ${String(categoryProductCounts.size).padEnd(17)}║`);
    console.log('╚════════════════════════════════════════╝');

    if (errorCount > 0) {
      console.log('\n⚠️  Some products could not be migrated. Please review the errors above.');
    } else {
      console.log('\n✅ Migration successful! All products now use dynamic category references.\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateProductCategories()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateProductCategories;
