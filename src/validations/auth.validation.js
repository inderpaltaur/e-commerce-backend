import { z } from 'zod';

// Register user schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),

    password: z.string()
      .min(6, 'Password must be at least 6 characters'),

    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must not exceed 100 characters'),

    phoneNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),

    photoURL: z.string()
      .url('Photo URL must be a valid URL')
      .optional(),

    authProvider: z.string()
      .default('Email')
      .optional()
  })
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),

    password: z.string()
      .min(1, 'Password is required')
  })
});

// Social auth schema
export const socialAuthSchema = z.object({
  body: z.object({
    uid: z.string()
      .min(1, 'User ID is required'),

    email: z.string()
      .email('Invalid email address')
      .min(1, 'Email is required'),

    name: z.string()
      .min(1, 'Name is required'),

    authProvider: z.enum(['Google', 'Facebook', 'GitHub', 'Twitter', 'Microsoft', 'Apple'], {
      errorMap: () => ({ message: 'Invalid authentication provider' })
    }),

    photoURL: z.string()
      .url('Photo URL must be a valid URL')
      .nullable()
      .optional(),

    phoneNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .nullable()
      .optional()
  })
});

// Verify token schema
export const verifyTokenSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token is required')
  })
});

// Generate custom token schema
export const generateCustomTokenSchema = z.object({
  body: z.object({
    uid: z.string()
      .min(1, 'User ID is required')
  })
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Token is required')
  })
});

// Link provider schema
export const linkProviderSchema = z.object({
  body: z.object({
    provider: z.enum(['Google', 'Facebook', 'GitHub', 'Twitter', 'Microsoft', 'Apple'], {
      errorMap: () => ({ message: 'Invalid authentication provider' })
    }),

    providerUid: z.string()
      .min(1, 'Provider user ID is required'),

    email: z.string()
      .email('Invalid email address')
      .optional()
  })
});

// Unlink provider schema
export const unlinkProviderSchema = z.object({
  body: z.object({
    provider: z.enum(['Google', 'Facebook', 'GitHub', 'Twitter', 'Microsoft', 'Apple', 'Email'], {
      errorMap: () => ({ message: 'Invalid authentication provider' })
    })
  })
});

// Revoke tokens schema (no body needed, uses authenticated user)
export const revokeTokensSchema = z.object({
  body: z.object({}).optional()
});
