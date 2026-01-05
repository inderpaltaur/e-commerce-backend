import { z } from 'zod';

// Initialize super admin schema (for OAuth-based setup)
export const initializeSuperAdminSchema = z.object({
  body: z.object({
    uid: z.string()
      .min(1, 'User ID is required'),

    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required'),

    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),

    photoURL: z.string()
      .url('Photo URL must be a valid URL')
      .optional(),

    authProvider: z.string()
      .min(1, 'Auth provider is required')
      .default('Google')
  })
});
