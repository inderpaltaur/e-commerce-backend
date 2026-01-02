import { z } from 'zod';

// Slug validation regex (lowercase letters, numbers, hyphens only)
const slugRegex = /^[a-z0-9-]+$/;

// SubCategory schema for creating category with subcategories
const subCategorySchema = z.object({
  subCategoryName: z.string()
    .min(1, 'Subcategory name is required')
    .max(100, 'Subcategory name must not exceed 100 characters'),

  subCategorySlug: z.string()
    .min(1, 'Subcategory slug is required')
    .regex(slugRegex, 'Subcategory slug must contain only lowercase letters, numbers, and hyphens'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .default('')
    .optional()
});

// Create category schema
export const createCategorySchema = z.object({
  body: z.object({
    categoryName: z.string()
      .min(1, 'Category name is required')
      .max(100, 'Category name must not exceed 100 characters'),

    categorySlug: z.string()
      .min(1, 'Category slug is required')
      .regex(slugRegex, 'Category slug must contain only lowercase letters, numbers, and hyphens'),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .default('')
      .optional(),

    imageUrl: z.string()
      .url('Image URL must be a valid URL')
      .optional(),

    subCategories: z.array(subCategorySchema)
      .default([])
      .optional(),

    isActive: z.boolean()
      .or(z.string().transform(val => val === 'true'))
      .default(true)
      .optional(),

    displayOrder: z.number()
      .int()
      .positive('Display order must be a positive integer')
      .or(z.string().transform(val => parseInt(val)))
      .default(1)
      .optional()
  })
});

// Update category schema
export const updateCategorySchema = z.object({
  body: z.object({
    categoryName: z.string()
      .max(100, 'Category name must not exceed 100 characters')
      .optional(),

    categorySlug: z.string()
      .regex(slugRegex, 'Category slug must contain only lowercase letters, numbers, and hyphens')
      .optional(),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional(),

    imageUrl: z.string()
      .url('Image URL must be a valid URL')
      .optional(),

    isActive: z.boolean()
      .or(z.string().transform(val => val === 'true'))
      .optional(),

    displayOrder: z.number()
      .int()
      .positive('Display order must be a positive integer')
      .or(z.string().transform(val => parseInt(val)))
      .optional()
  })
});

// Add subcategory schema
export const addSubCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'Category ID is required')
  }),
  body: z.object({
    subCategoryName: z.string()
      .min(1, 'Subcategory name is required')
      .max(100, 'Subcategory name must not exceed 100 characters'),

    subCategorySlug: z.string()
      .min(1, 'Subcategory slug is required')
      .regex(slugRegex, 'Subcategory slug must contain only lowercase letters, numbers, and hyphens'),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .default('')
      .optional()
  })
});

// Update subcategory schema
export const updateSubCategorySchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    subCategoryId: z.string().min(1, 'Subcategory ID is required')
  }),
  body: z.object({
    subCategoryName: z.string()
      .max(100, 'Subcategory name must not exceed 100 characters')
      .optional(),

    subCategorySlug: z.string()
      .regex(slugRegex, 'Subcategory slug must contain only lowercase letters, numbers, and hyphens')
      .optional(),

    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
  })
});

// Category ID param schema
export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required')
  })
});

// Category slug param schema
export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Category slug is required')
  })
});

// Subcategory params schema
export const subCategoryParamsSchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'Category ID is required'),
    subCategoryId: z.string().min(1, 'Subcategory ID is required')
  })
});

// Get categories query schema
export const getCategoriesQuerySchema = z.object({
  query: z.object({
    isActive: z.enum(['true', 'false']).optional()
  })
});

// Get subcategories param schema
export const getSubCategoriesSchema = z.object({
  params: z.object({
    categoryId: z.string().min(1, 'Category ID is required')
  })
});
