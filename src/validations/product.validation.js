import { z } from 'zod';

// Color schema for product colors
const colorSchema = z.object({
  colorName: z.string().min(1, 'Color name is required'),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color code must be a valid hex color (e.g., #FFFFFF)'),
  colorImage: z.string().url('Color image must be a valid URL').optional(),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer')
});

// Dimensions schema
const dimensionsSchema = z.object({
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive')
}).optional();

// Create product schema
export const createProductSchema = z.object({
  body: z.object({
    productName: z.string()
      .min(1, 'Product name is required')
      .max(200, 'Product name must not exceed 200 characters'),

    productDescription: z.string()
      .min(1, 'Product description is required')
      .max(2000, 'Product description must not exceed 2000 characters'),

    // NEW: Dynamic category reference (preferred)
    categoryId: z.string()
      .min(1, 'Category ID is required')
      .optional(),

    categoryPath: z.string().optional(), // Auto-populated by backend
    categoryPathIds: z.array(z.string()).optional(), // Auto-populated by backend

    // OLD: Legacy category fields (for backward compatibility)
    category: z.enum(['men', 'women', 'kids', 'unisex'], {
      errorMap: () => ({ message: 'Category must be one of: men, women, kids, unisex' })
    }).optional(),

    subCategory: z.string().optional(),

    productType: z.string().min(1, 'Product type is required'),

    price: z.number()
      .positive('Price must be positive')
      .or(z.string().transform(val => parseFloat(val))),

    currencyType: z.enum(['INR', 'USD', 'EUR', 'GBP'], {
      errorMap: () => ({ message: 'Currency type must be one of: INR, USD, EUR, GBP' })
    }).default('INR').optional(),

    offerType: z.enum(['percentage', 'amount', 'none'], {
      errorMap: () => ({ message: 'Offer type must be one of: percentage, amount, none' })
    }).default('none').optional(),

    offerValue: z.number()
      .min(0, 'Offer value must be non-negative')
      .or(z.string().transform(val => parseFloat(val)))
      .default(0)
      .optional(),

    tax: z.number()
      .min(0, 'Tax must be at least 0')
      .max(100, 'Tax must not exceed 100')
      .or(z.string().transform(val => parseFloat(val)))
      .default(0)
      .optional(),

    sizes: z.array(z.string())
      .min(1, 'At least one size is required'),

    colors: z.array(colorSchema)
      .min(1, 'At least one color is required'),

    images: z.array(z.string().url('Each image must be a valid URL'))
      .default([])
      .optional(),

    units: z.number()
      .int()
      .min(0, 'Units must be a non-negative integer')
      .or(z.string().transform(val => parseInt(val))),

    tags: z.array(z.string()).default([]).optional(),

    brand: z.string().optional(),

    material: z.string().optional(),

    careInstructions: z.string().optional(),

    weight: z.number()
      .positive('Weight must be positive')
      .or(z.string().transform(val => parseFloat(val)))
      .optional(),

    dimensions: dimensionsSchema,

    sku: z.string().optional(),

    vendor: z.string().optional(),

    countryOfOrigin: z.string().default('India').optional(),

    isFeatured: z.boolean()
      .or(z.string().transform(val => val === 'true'))
      .default(false)
      .optional()
  }).refine(
    (data) => data.categoryId || data.category,
    {
      message: 'Either categoryId (new format) or category (legacy format) must be provided',
      path: ['categoryId']
    }
  )
});

// Update product schema (all fields optional except nothing is required)
export const updateProductSchema = z.object({
  body: z.object({
    productName: z.string()
      .max(200, 'Product name must not exceed 200 characters')
      .optional(),

    productDescription: z.string()
      .max(2000, 'Product description must not exceed 2000 characters')
      .optional(),

    // NEW: Dynamic category reference
    categoryId: z.string().min(1).optional(),
    categoryPath: z.string().optional(),
    categoryPathIds: z.array(z.string()).optional(),

    // OLD: Legacy category fields
    category: z.enum(['men', 'women', 'kids', 'unisex'], {
      errorMap: () => ({ message: 'Category must be one of: men, women, kids, unisex' })
    }).optional(),

    subCategory: z.string().optional(),

    productType: z.string().optional(),

    price: z.number()
      .positive('Price must be positive')
      .or(z.string().transform(val => parseFloat(val)))
      .optional(),

    currencyType: z.enum(['INR', 'USD', 'EUR', 'GBP'], {
      errorMap: () => ({ message: 'Currency type must be one of: INR, USD, EUR, GBP' })
    }).optional(),

    offerType: z.enum(['percentage', 'amount', 'none'], {
      errorMap: () => ({ message: 'Offer type must be one of: percentage, amount, none' })
    }).optional(),

    offerValue: z.number()
      .min(0, 'Offer value must be non-negative')
      .or(z.string().transform(val => parseFloat(val)))
      .optional(),

    tax: z.number()
      .min(0, 'Tax must be at least 0')
      .max(100, 'Tax must not exceed 100')
      .or(z.string().transform(val => parseFloat(val)))
      .optional(),

    sizes: z.array(z.string()).optional(),

    colors: z.array(colorSchema).optional(),

    images: z.array(z.string().url('Each image must be a valid URL')).optional(),

    units: z.number()
      .int()
      .min(0, 'Units must be a non-negative integer')
      .or(z.string().transform(val => parseInt(val)))
      .optional(),

    tags: z.array(z.string()).optional(),

    brand: z.string().optional(),

    material: z.string().optional(),

    careInstructions: z.string().optional(),

    weight: z.number()
      .positive('Weight must be positive')
      .or(z.string().transform(val => parseFloat(val)))
      .optional(),

    dimensions: dimensionsSchema,

    sku: z.string().optional(),

    vendor: z.string().optional(),

    countryOfOrigin: z.string().optional(),

    isFeatured: z.boolean()
      .or(z.string().transform(val => val === 'true'))
      .optional(),

    isActive: z.boolean()
      .or(z.string().transform(val => val === 'true'))
      .optional()
  })
});

// Update stock schema
export const updateStockSchema = z.object({
  body: z.object({
    units: z.number()
      .int()
      .min(0, 'Units must be a non-negative integer')
      .or(z.string().transform(val => parseInt(val)))
      .optional(),

    colorStock: z.array(z.object({
      colorName: z.string().min(1, 'Color name is required'),
      stock: z.number()
        .int()
        .min(0, 'Stock must be a non-negative integer')
        .or(z.string().transform(val => parseInt(val)))
    })).optional()
  }).refine(
    data => data.units !== undefined || data.colorStock !== undefined,
    { message: 'Either units or colorStock must be provided' }
  )
});

// Update sold count schema
export const updateSoldCountSchema = z.object({
  body: z.object({
    quantity: z.number()
      .int()
      .min(1, 'Quantity must be at least 1')
      .or(z.string().transform(val => parseInt(val)))
  })
});

// Get all products query schema
export const getProductsQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    category: z.string().optional(),

    subCategory: z.string().optional(),

    productType: z.string().optional(),

    minPrice: z.string()
      .transform(val => parseFloat(val))
      .pipe(z.number().min(0))
      .optional(),

    maxPrice: z.string()
      .transform(val => parseFloat(val))
      .pipe(z.number().min(0))
      .optional(),

    tags: z.string().optional(),

    isFeatured: z.enum(['true', 'false']).optional(),

    isActive: z.enum(['true', 'false', 'all']).default('true').optional(),

    sortBy: z.enum(['price', 'createdAt', 'soldCount', 'rating.average'])
      .default('createdAt')
      .optional(),

    sortOrder: z.enum(['asc', 'desc'])
      .default('desc')
      .optional(),

    search: z.string().optional()
  })
});

// Get products by category params schema
export const getProductsByCategorySchema = z.object({
  params: z.object({
    category: z.string().min(1, 'Category is required')
  }),
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    subCategory: z.string().optional(),

    isActive: z.enum(['true', 'false', 'all']).default('true').optional()
  })
});

// Product ID param schema
export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required')
  })
});
