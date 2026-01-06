import { z } from 'zod';

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required')
});

// Update user profile schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string()
      .max(100, 'Name must not exceed 100 characters')
      .optional(),

    phoneNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),

    photoURL: z.string()
      .url('Photo URL must be a valid URL')
      .optional(),

    address: addressSchema.optional()
  })
});

// Add to wishlist schema
export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string()
      .min(1, 'Product ID is required')
  })
});

// Remove from wishlist schema
export const removeFromWishlistSchema = z.object({
  params: z.object({
    productId: z.string()
      .min(1, 'Product ID is required')
  })
});

// Get all users query schema (admin)
export const getAllUsersQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    accountStatus: z.enum(['active', 'blocked', 'suspended']).optional(),

    role: z.string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const roles = val.split(',').map(r => r.trim());
        const validRoles = ['customer', 'admin', 'super_admin'];
        return roles.every(role => validRoles.includes(role));
      }, {
        message: 'Role must be one of: customer, admin, super_admin, or comma-separated combination'
      })
  })
});

// User ID param schema
export const userIdParamSchema = z.object({
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  })
});

// Update account status schema (admin)
export const updateAccountStatusSchema = z.object({
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }),
  body: z.object({
    accountStatus: z.enum(['active', 'blocked', 'suspended'], {
      errorMap: () => ({ message: 'Account status must be one of: active, blocked, suspended' })
    })
  })
});

// Update role schema (admin)
export const updateRoleSchema = z.object({
  params: z.object({
    uid: z.string().min(1, 'User ID is required')
  }),
  body: z.object({
    role: z.enum(['customer', 'admin', 'super_admin'], {
      errorMap: () => ({ message: 'Role must be one of: customer, admin, super_admin' })
    })
  })
});
