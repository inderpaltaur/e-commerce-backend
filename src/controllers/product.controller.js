import { db } from '../config/firebase.js';

export const productController = {
  // Get all products with advanced filtering
  getAllProducts: async (req, res) => {
    try {
      const {
        limit = 50,
        category,
        subCategory,
        productType,
        minPrice,
        maxPrice,
        tags,
        isFeatured,
        isActive = 'true',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search
      } = req.query;

      let query = db.collection('products');

      // Filter by active status
      if (isActive !== 'all') {
        query = query.where('isActive', '==', isActive === 'true');
      }

      // Filter by category
      if (category) {
        query = query.where('category', '==', category);
      }

      // Filter by subcategory
      if (subCategory) {
        query = query.where('subCategory', '==', subCategory);
      }

      // Filter by product type
      if (productType) {
        query = query.where('productType', '==', productType);
      }

      // Filter by featured
      if (isFeatured) {
        query = query.where('isFeatured', '==', isFeatured === 'true');
      }

      // Price range filtering (requires composite index)
      if (minPrice) {
        query = query.where('price', '>=', parseFloat(minPrice));
      }

      if (maxPrice) {
        query = query.where('price', '<=', parseFloat(maxPrice));
      }

      // Tags filtering (array-contains)
      if (tags) {
        query = query.where('tags', 'array-contains', tags);
      }

      // Sorting
      const validSortFields = ['price', 'createdAt', 'soldCount', 'rating.average'];
      if (validSortFields.includes(sortBy)) {
        query = query.orderBy(sortBy, sortOrder);
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      let products = [];

      snapshot.forEach(doc => {
        const productData = doc.data();
        products.push({
          id: doc.id,
          ...productData,
          // Calculate final price
          finalPrice: calculateFinalPrice(productData),
          // Calculate price with tax
          priceWithTax: calculatePriceWithTax(productData),
          // Check stock status
          inStock: productData.units > 0
        });
      });

      // Client-side search filtering (if needed)
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p =>
          p.productName.toLowerCase().includes(searchLower) ||
          p.productDescription.toLowerCase().includes(searchLower) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

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

      const productData = productDoc.data();

      res.status(200).json({
        success: true,
        data: {
          id: productDoc.id,
          ...productData,
          finalPrice: calculateFinalPrice(productData),
          priceWithTax: calculatePriceWithTax(productData),
          inStock: productData.units > 0
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
      const { category } = req.params;
      const { limit = 50, subCategory, isActive = 'true' } = req.query;

      let query = db.collection('products')
        .where('category', '==', category);

      if (isActive !== 'all') {
        query = query.where('isActive', '==', isActive === 'true');
      }

      if (subCategory) {
        query = query.where('subCategory', '==', subCategory);
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      const products = [];

      snapshot.forEach(doc => {
        const productData = doc.data();
        products.push({
          id: doc.id,
          ...productData,
          finalPrice: calculateFinalPrice(productData),
          priceWithTax: calculatePriceWithTax(productData),
          inStock: productData.units > 0
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

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const snapshot = await db.collection('products')
        .where('isActive', '==', true)
        .where('isFeatured', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(parseInt(limit))
        .get();

      const products = [];

      snapshot.forEach(doc => {
        const productData = doc.data();
        products.push({
          id: doc.id,
          ...productData,
          finalPrice: calculateFinalPrice(productData),
          priceWithTax: calculatePriceWithTax(productData),
          inStock: productData.units > 0
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
        message: 'Error fetching featured products',
        error: error.message
      });
    }
  },

  // Get trending products (by sold count)
  getTrendingProducts: async (req, res) => {
    try {
      const { limit = 20 } = req.query;

      const snapshot = await db.collection('products')
        .where('isActive', '==', true)
        .orderBy('soldCount', 'desc')
        .limit(parseInt(limit))
        .get();

      const products = [];

      snapshot.forEach(doc => {
        const productData = doc.data();
        products.push({
          id: doc.id,
          ...productData,
          finalPrice: calculateFinalPrice(productData),
          priceWithTax: calculatePriceWithTax(productData),
          inStock: productData.units > 0
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
        message: 'Error fetching trending products',
        error: error.message
      });
    }
  },

  // Create product (enhanced for dynamic categories)
  createProduct: async (req, res) => {
    try {
      const {
        productName,
        productDescription,
        categoryId, // NEW: Dynamic category reference
        category, // OLD: Legacy category
        subCategory, // OLD: Legacy subcategory
        productType,
        price,
        currencyType = 'INR',
        offerType = 'none',
        offerValue = 0,
        tax = 0,
        sizes,
        colors,
        images,
        units,
        tags = [],
        brand,
        material,
        careInstructions,
        weight,
        dimensions,
        sku,
        vendor,
        countryOfOrigin = 'India',
        isFeatured = false
      } = req.body;

      // Validate required fields
      if (!productName || !productDescription || !productType || !price ||
          !sizes || !colors || !images || units === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Handle category - either new (categoryId) or old (category/subCategory)
      let categoryPath = null;
      let categoryPathIds = null;
      let finalCategoryId = categoryId;
      let finalCategory = category;
      let finalSubCategory = subCategory;

      // If categoryId is provided (new format), fetch category data
      if (categoryId) {
        const categoryDoc = await db.collection('categories').doc(categoryId).get();

        if (!categoryDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }

        const categoryData = categoryDoc.data();
        categoryPath = categoryData.path || `/${categoryData.categorySlug}`;
        categoryPathIds = categoryData.pathIds || [categoryId];
      } else if (!category) {
        // Neither categoryId nor legacy category provided
        return res.status(400).json({
          success: false,
          message: 'Either categoryId (new format) or category (legacy format) is required'
        });
      }

      // Calculate total stock from colors
      const totalColorStock = colors.reduce((sum, color) => sum + (color.stock || 0), 0);

      const productData = {
        productName,
        productDescription,

        // NEW: Dynamic category fields
        ...(finalCategoryId && { categoryId: finalCategoryId }),
        ...(categoryPath && { categoryPath }),
        ...(categoryPathIds && { categoryPathIds }),

        // OLD: Legacy category fields (for backward compatibility)
        ...(finalCategory && { category: finalCategory }),
        ...(finalSubCategory && { subCategory: finalSubCategory }),

        productType,
        price: parseFloat(price),
        currencyType,
        offerType,
        offerValue: parseFloat(offerValue),
        tax: parseFloat(tax),
        sizes: Array.isArray(sizes) ? sizes : [sizes],
        colors,
        images: Array.isArray(images) ? images : [images],
        units: parseInt(units),
        soldCount: 0,
        tags: Array.isArray(tags) ? tags : [],
        brand: brand || '',
        material: material || '',
        careInstructions: careInstructions || '',
        weight: weight ? parseFloat(weight) : 0,
        dimensions: dimensions || null,
        sku: sku || `${finalCategory || 'product'}-${productType}-${Date.now()}`,
        vendor: vendor || '',
        countryOfOrigin,
        isFeatured,
        isActive: true,
        rating: {
          average: 0,
          count: 0,
          distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection('products').add(productData);

      // Add productId to the document
      await db.collection('products').doc(docRef.id).update({
        productId: docRef.id
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: docRef.id,
          productId: docRef.id,
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

  // Update product (enhanced for dynamic categories)
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updateData.productId;
      delete updateData.soldCount;
      delete updateData.createdAt;
      delete updateData.rating;

      // Handle category update - if categoryId is being changed
      if (updateData.categoryId) {
        const categoryDoc = await db.collection('categories').doc(updateData.categoryId).get();

        if (!categoryDoc.exists) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }

        const categoryData = categoryDoc.data();
        updateData.categoryPath = categoryData.path || `/${categoryData.categorySlug}`;
        updateData.categoryPathIds = categoryData.pathIds || [updateData.categoryId];
      }

      // Set updated timestamp
      updateData.updatedAt = new Date().toISOString();

      // Parse numeric fields if provided
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }

      if (updateData.offerValue) {
        updateData.offerValue = parseFloat(updateData.offerValue);
      }

      if (updateData.tax) {
        updateData.tax = parseFloat(updateData.tax);
      }

      if (updateData.units !== undefined) {
        updateData.units = parseInt(updateData.units);
      }

      if (updateData.weight) {
        updateData.weight = parseFloat(updateData.weight);
      }

      await db.collection('products').doc(id).update(updateData);

      const updatedDoc = await db.collection('products').doc(id).get();
      const productData = updatedDoc.data();

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: {
          id: updatedDoc.id,
          ...productData,
          finalPrice: calculateFinalPrice(productData),
          priceWithTax: calculatePriceWithTax(productData),
          inStock: productData.units > 0
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

  // Update product stock
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { units, colorStock } = req.body;

      const productDoc = await db.collection('products').doc(id).get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      // Update overall units
      if (units !== undefined) {
        updateData.units = parseInt(units);
      }

      // Update color-specific stock
      if (colorStock) {
        const productData = productDoc.data();
        const updatedColors = productData.colors.map(color => {
          const stockUpdate = colorStock.find(cs => cs.colorName === color.colorName);
          if (stockUpdate) {
            return { ...color, stock: parseInt(stockUpdate.stock) };
          }
          return color;
        });

        updateData.colors = updatedColors;

        // Recalculate total units from color stock
        updateData.units = updatedColors.reduce((sum, color) => sum + color.stock, 0);
      }

      await db.collection('products').doc(id).update(updateData);

      const updatedDoc = await db.collection('products').doc(id).get();
      const productData = updatedDoc.data();

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          id: updatedDoc.id,
          units: productData.units,
          colors: productData.colors
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating stock',
        error: error.message
      });
    }
  },

  // Soft delete product (set isActive to false)
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      if (permanent === 'true') {
        // Permanent deletion
        await db.collection('products').doc(id).delete();

        res.status(200).json({
          success: true,
          message: 'Product permanently deleted'
        });
      } else {
        // Soft delete
        await db.collection('products').doc(id).update({
          isActive: false,
          updatedAt: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message: 'Product deactivated successfully'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  },

  // Update sold count (when order is completed)
  updateSoldCount: async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }

      const productDoc = await db.collection('products').doc(id).get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const productData = productDoc.data();
      const newSoldCount = (productData.soldCount || 0) + parseInt(quantity);

      await db.collection('products').doc(id).update({
        soldCount: newSoldCount,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Sold count updated successfully',
        data: {
          soldCount: newSoldCount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating sold count',
        error: error.message
      });
    }
  }
};

// Helper function to calculate final price
function calculateFinalPrice(product) {
  if (!product.price) return 0;

  const basePrice = product.price;

  if (product.offerType === 'percentage' && product.offerValue) {
    return basePrice - (basePrice * product.offerValue / 100);
  } else if (product.offerType === 'amount' && product.offerValue) {
    return Math.max(0, basePrice - product.offerValue);
  }

  return basePrice;
}

// Helper function to calculate price with tax
function calculatePriceWithTax(product) {
  const finalPrice = calculateFinalPrice(product);
  const tax = product.tax || 0;

  return finalPrice + (finalPrice * tax / 100);
}

export default productController;
