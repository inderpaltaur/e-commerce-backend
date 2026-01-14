import { z } from 'zod';

// URL validation helper
const urlSchema = z.string().refine(val => {
  if (!val) return true; // Allow empty strings
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, 'Must be a valid URL');

// Email validation helper
const emailSchema = z.string().email('Must be a valid email address');

// Phone validation helper (basic international format)
const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Must be a valid phone number');

// Time validation helper (HH:MM format)
const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format');

// Social link schema
const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: urlSchema,
  label: z.string().min(1, 'Label is required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Business hours schema
const businessHoursSchema = z.object({
  monday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  tuesday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  wednesday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  thursday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  friday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  saturday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional(),
  sunday: z.object({
    open: timeSchema.nullable(),
    close: timeSchema.nullable(),
    isOpen: z.boolean()
  }).optional()
});

// Logo schema
const logoSchema = z.object({
  url: urlSchema,
  alt: z.string().max(200, 'Alt text must not exceed 200 characters').optional(),
  fileName: z.string().optional()
});

// Favicon schema
const faviconSchema = z.object({
  url: urlSchema,
  fileName: z.string().optional()
});

// Contact schema
const contactSchema = z.object({
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  supportEmail: emailSchema.optional()
});

// Address schema
const addressSchema = z.object({
  street: z.string().max(200, 'Street must not exceed 200 characters').optional(),
  city: z.string().max(100, 'City must not exceed 100 characters').optional(),
  state: z.string().max(100, 'State must not exceed 100 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must not exceed 20 characters').optional(),
  country: z.string().max(100, 'Country must not exceed 100 characters').optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

// Maintenance schema
const maintenanceSchema = z.object({
  isEnabled: z.boolean().default(false),
  message: z.string().max(500, 'Message must not exceed 500 characters').optional(),
  estimatedTime: z.string().max(100, 'Estimated time must not exceed 100 characters').optional()
});

// SEO schema
const seoSchema = z.object({
  metaTitle: z.string().max(60, 'Meta title must not exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must not exceed 160 characters').optional(),
  keywords: z.array(z.string()).default([])
});

// Update site info schema
export const updateSiteInfoSchema = z.object({
  body: z.object({
    // Basic Info
    projectName: z.string().min(1, 'Project name is required').max(100, 'Project name must not exceed 100 characters').optional(),
    description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
    tagline: z.string().max(200, 'Tagline must not exceed 200 characters').optional(),

    // Branding
    logo: logoSchema.optional(),
    favicon: faviconSchema.optional(),

    // Contact Information
    contact: contactSchema.optional(),

    // Address
    address: addressSchema.optional(),

    // Location/Region
    region: z.string().max(100, 'Region must not exceed 100 characters').optional(),
    timezone: z.string().max(50, 'Timezone must not exceed 50 characters').optional(),
    currency: z.string().length(3, 'Currency must be a 3-letter code').optional(),
    language: z.string().length(2, 'Language must be a 2-letter code').optional(),

    // Social Media Links
    socialLinks: z.array(socialLinkSchema).default([]).optional(),

    // Business Information
    businessHours: businessHoursSchema.optional(),

    // Additional Settings
    maintenance: maintenanceSchema.optional(),
    seo: seoSchema.optional(),

    // Status
    isActive: z.boolean().optional()
  })
});

// Upload logo schema
export const uploadLogoSchema = z.object({
  body: z.object({
    logoUrl: urlSchema,
    alt: z.string().max(200, 'Alt text must not exceed 200 characters').optional(),
    fileName: z.string().optional()
  })
});

// Upload favicon schema
export const uploadFaviconSchema = z.object({
  body: z.object({
    faviconUrl: urlSchema,
    fileName: z.string().optional()
  })
});

// Initialize site info schema (no body required, uses defaults)
export const initializeSiteInfoSchema = z.object({
  body: z.object({}).optional()
});