import { z } from 'zod';

// Create admin request schema
export const createAdminRequestSchema = z.object({
  body: z.object({
    requestedRole: z.enum(['admin', 'super_admin'], {
      errorMap: () => ({ message: 'Requested role must be either admin or super_admin' })
    }),
    reason: z.string()
      .min(10, 'Please provide a reason with at least 10 characters')
      .max(500, 'Reason must not exceed 500 characters')
  })
});

// Get admin requests query schema
export const getAdminRequestsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive().max(100))
      .default('50')
      .optional()
  })
});

// Admin request ID param schema
export const adminRequestIdParamSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, 'Request ID is required')
  })
});

// Approve/Reject admin request schema
export const reviewAdminRequestSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, 'Request ID is required')
  }),
  body: z.object({
    notes: z.string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional()
  })
});
