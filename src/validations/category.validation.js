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

// Create category schema (enhanced for unlimited nesting)
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
      .refine(val => {
        // Allow empty string for optional field
        if (!val) return true;
        // Allow URLs
        try {
          new URL(val);
          return true;
        } catch {
          // Allow local paths starting with /
          return val.startsWith('/');
        }
      }, 'Image URL must be a valid URL or local path')
      .optional(),

    // NEW: Parent category ID for hierarchy support
    parentId: z.string()
      .min(1)
      .nullable()
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
      .refine(val => {
        // Allow empty string for optional field
        if (!val) return true;
        // Allow URLs
        try {
          new URL(val);
          return true;
        } catch {
          // Allow local paths starting with /
          return val.startsWith('/');
        }
      }, 'Image URL must be a valid URL or local path')
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

// NEW: Get category tree query schema
export const getCategoryTreeSchema = z.object({
  query: z.object({
    maxDepth: z.string()
      .transform(val => parseInt(val))
      .optional(),
    parentId: z.string()
      .optional(),
    includeInactive: z.enum(['true', 'false'])
      .transform(val => val === 'true')
      .optional()
  })
});

// NEW: Move category schema
export const moveCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required')
  }),
  body: z.object({
    newParentId: z.string()
      .nullable(),
    newDisplayOrder: z.number()
      .int()
      .positive()
      .optional()
  })
});

// NEW: Reorder categories schema
export const reorderCategoriesSchema = z.object({
  body: z.object({
    updates: z.array(
      z.object({
        id: z.string().min(1, 'Category ID is required'),
        displayOrder: z.number()
          .int()
          .positive('Display order must be a positive integer')
      })
    ).min(1, 'At least one category update is required')
  })
});

// NEW: Get categories by level schema
export const getCategoriesByLevelSchema = z.object({
  params: z.object({
    level: z.string()
      .transform(val => parseInt(val))
      .refine(val => !isNaN(val) && val >= 0, 'Level must be a non-negative integer')
  })
});
