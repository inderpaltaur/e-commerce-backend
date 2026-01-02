# Zod Validation Documentation

Complete guide to using Zod validation in the E-Commerce backend API.

## Overview

This project uses **Zod** for request validation instead of express-validator. Zod is a TypeScript-first schema validation library that provides:

- Type-safe validation schemas
- Composable and reusable schemas
- Better error messages
- Transform and refine capabilities
- Works seamlessly with JavaScript

---

## Table of Contents

1. [Installation](#installation)
2. [Validation Middleware](#validation-middleware)
3. [Validation Schemas](#validation-schemas)
4. [Usage Examples](#usage-examples)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Installation

Zod is already included in the project dependencies:

```json
{
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

To install:
```bash
npm install
```

---

## Validation Middleware

Location: `src/middleware/validation.middleware.js`

### Available Middleware Functions

#### 1. `validate(schema)`
Validates body, query, and params against a combined schema.

```javascript
import { validate } from '../middleware/validation.middleware.js';

router.post('/endpoint', validate(combinedSchema), controller);
```

#### 2. `validateBody(schema)`
Validates only request body.

```javascript
import { validateBody } from '../middleware/validation.middleware.js';

router.post('/endpoint', validateBody(bodySchema), controller);
```

#### 3. `validateQuery(schema)`
Validates only query parameters.

```javascript
import { validateQuery } from '../middleware/validation.middleware.js';

router.get('/endpoint', validateQuery(querySchema), controller);
```

#### 4. `validateParams(schema)`
Validates only URL parameters.

```javascript
import { validateParams } from '../middleware/validation.middleware.js';

router.get('/endpoint/:id', validateParams(paramsSchema), controller);
```

---

## Validation Schemas

All validation schemas are located in `src/validations/` directory:

- **product.validation.js** - Product-related validations
- **category.validation.js** - Category and subcategory validations
- **auth.validation.js** - Authentication validations
- **user.validation.js** - User profile and admin validations

### Schema Structure

Schemas are organized to validate different parts of the request:

```javascript
import { z } from 'zod';

export const exampleSchema = z.object({
  body: z.object({
    // Request body validation
  }),
  query: z.object({
    // Query params validation
  }),
  params: z.object({
    // URL params validation
  })
});
```

---

## Usage Examples

### Example 1: Product Creation

**Schema** (`src/validations/product.validation.js`):
```javascript
export const createProductSchema = z.object({
  body: z.object({
    productName: z.string()
      .min(1, 'Product name is required')
      .max(200, 'Product name must not exceed 200 characters'),

    price: z.number()
      .positive('Price must be positive')
      .or(z.string().transform(val => parseFloat(val))),

    category: z.enum(['men', 'women', 'kids', 'unisex']),

    sizes: z.array(z.string())
      .min(1, 'At least one size is required'),

    colors: z.array(z.object({
      colorName: z.string().min(1),
      colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      stock: z.number().int().min(0)
    })).min(1)
  })
});
```

**Route** (`src/routes/product.routes.js`):
```javascript
import { validate } from '../middleware/validation.middleware.js';
import { createProductSchema } from '../validations/product.validation.js';

router.post(
  '/',
  verifyToken,
  checkAdmin,
  validate(createProductSchema),
  productController.createProduct
);
```

**Request Example**:
```json
{
  "productName": "Cotton T-Shirt",
  "price": 999,
  "category": "men",
  "sizes": ["S", "M", "L"],
  "colors": [
    {
      "colorName": "White",
      "colorCode": "#FFFFFF",
      "stock": 50
    }
  ]
}
```

### Example 2: Query Parameter Validation

**Schema**:
```javascript
export const getProductsQuerySchema = z.object({
  query: z.object({
    limit: z.string()
      .transform(val => parseInt(val))
      .pipe(z.number().int().positive())
      .default('50')
      .optional(),

    category: z.string().optional(),

    minPrice: z.string()
      .transform(val => parseFloat(val))
      .pipe(z.number().min(0))
      .optional(),

    sortBy: z.enum(['price', 'createdAt', 'soldCount'])
      .default('createdAt')
      .optional()
  })
});
```

**Usage**:
```javascript
router.get(
  '/',
  validate(getProductsQuerySchema),
  productController.getAllProducts
);
```

**Request Example**:
```
GET /products?limit=20&category=men&minPrice=500&sortBy=price
```

### Example 3: URL Parameter Validation

**Schema**:
```javascript
export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required')
  })
});
```

**Usage**:
```javascript
router.get(
  '/:id',
  validate(productIdParamSchema),
  productController.getProductById
);
```

### Example 4: Combining Multiple Validations

**Schema**:
```javascript
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
      .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
      .optional()
  })
});
```

**Usage**:
```javascript
router.put(
  '/:categoryId/subcategories/:subCategoryId',
  verifyToken,
  checkAdmin,
  validate(updateSubCategorySchema),
  categoryController.updateSubCategory
);
```

---

## Error Handling

### Error Response Format

When validation fails, the middleware returns a standardized error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.productName",
      "message": "Product name is required"
    },
    {
      "field": "body.price",
      "message": "Price must be positive"
    }
  ]
}
```

### Common Validation Errors

1. **Missing Required Field**:
```json
{
  "field": "body.email",
  "message": "Email is required"
}
```

2. **Invalid Format**:
```json
{
  "field": "body.colorCode",
  "message": "Color code must be a valid hex color (e.g., #FFFFFF)"
}
```

3. **Out of Range**:
```json
{
  "field": "body.tax",
  "message": "Tax must not exceed 100"
}
```

4. **Invalid Enum Value**:
```json
{
  "field": "body.category",
  "message": "Category must be one of: men, women, kids, unisex"
}
```

---

## Best Practices

### 1. Use Transformations for Type Coercion

Query and URL params are always strings. Use transformations to convert them:

```javascript
z.string()
  .transform(val => parseInt(val))
  .pipe(z.number().int().positive())
```

### 2. Provide Clear Error Messages

Always include custom error messages:

```javascript
z.string().min(1, 'Product name is required')
z.number().positive('Price must be positive')
z.enum(['men', 'women'], {
  errorMap: () => ({ message: 'Invalid category' })
})
```

### 3. Use `.optional()` and `.default()`

Make optional fields explicit:

```javascript
z.string().optional()  // Field is optional
z.string().default('India').optional()  // Optional with default value
```

### 4. Validate Complex Objects

Use nested schemas for complex structures:

```javascript
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1)
});

const userSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    address: addressSchema.optional()
  })
});
```

### 5. Reuse Common Patterns

Create reusable schemas:

```javascript
// Reusable slug validation
const slugRegex = /^[a-z0-9-]+$/;
const slugSchema = z.string().regex(slugRegex, 'Invalid slug format');

// Use in multiple places
export const categorySchema = z.object({
  body: z.object({
    categorySlug: slugSchema,
    subCategorySlug: slugSchema
  })
});
```

### 6. Use `.refine()` for Custom Validation

Add custom validation logic:

```javascript
export const updateStockSchema = z.object({
  body: z.object({
    units: z.number().optional(),
    colorStock: z.array(z.object({...})).optional()
  }).refine(
    data => data.units !== undefined || data.colorStock !== undefined,
    { message: 'Either units or colorStock must be provided' }
  )
});
```

### 7. Validate Arrays with Constraints

```javascript
// Array with minimum length
z.array(z.string()).min(1, 'At least one size is required')

// Array with specific object structure
z.array(z.object({
  colorName: z.string(),
  stock: z.number().int().min(0)
})).min(1, 'At least one color is required')
```

### 8. Handle File Uploads

For URLs and file paths:

```javascript
z.string().url('Must be a valid URL')
z.array(z.string().url()).min(1, 'At least one image is required')
```

### 9. Phone Number Validation

Use regex for international phone numbers:

```javascript
z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
```

### 10. Email Validation

```javascript
z.string().email('Invalid email address')
```

---

## Common Zod Patterns

### String Validation
```javascript
z.string()                          // Any string
z.string().min(1)                   // Non-empty string
z.string().max(100)                 // Max length
z.string().email()                  // Email format
z.string().url()                    // URL format
z.string().regex(/pattern/)         // Custom regex
z.string().optional()               // Optional field
z.string().default('value')         // Default value
```

### Number Validation
```javascript
z.number()                          // Any number
z.number().int()                    // Integer only
z.number().positive()               // Positive number
z.number().min(0)                   // Minimum value
z.number().max(100)                 // Maximum value
z.number().or(z.string().transform(parseFloat))  // String to number
```

### Array Validation
```javascript
z.array(z.string())                 // Array of strings
z.array(z.number()).min(1)          // Non-empty array
z.array(z.object({...}))            // Array of objects
```

### Enum Validation
```javascript
z.enum(['option1', 'option2'])
z.enum(['men', 'women', 'kids'], {
  errorMap: () => ({ message: 'Custom error' })
})
```

### Boolean Validation
```javascript
z.boolean()
z.boolean().or(z.string().transform(val => val === 'true'))  // String to boolean
```

### Object Validation
```javascript
z.object({
  field1: z.string(),
  field2: z.number().optional()
})
```

---

## Migration from Express-Validator

If you're migrating from express-validator:

| Express-Validator | Zod |
|-------------------|-----|
| `body('email').isEmail()` | `z.string().email()` |
| `body('age').isInt()` | `z.number().int()` |
| `body('name').notEmpty()` | `z.string().min(1)` |
| `body('url').isURL()` | `z.string().url()` |
| `body('phone').isMobilePhone()` | `z.string().regex(/^\+?[1-9]\d{1,14}$/)` |
| `body('status').isIn(['active', 'inactive'])` | `z.enum(['active', 'inactive'])` |

---

## Testing Validation

### Test Valid Request
```javascript
const validData = {
  body: {
    productName: "Cotton T-Shirt",
    price: 999,
    category: "men"
  }
};

const result = await createProductSchema.parseAsync(validData);
// Result: validated and transformed data
```

### Test Invalid Request
```javascript
try {
  const invalidData = {
    body: {
      productName: "",  // Invalid: empty string
      price: -10,       // Invalid: negative
      category: "invalid"  // Invalid: not in enum
    }
  };

  await createProductSchema.parseAsync(invalidData);
} catch (error) {
  // error.errors contains all validation errors
  console.log(error.errors);
}
```

---

## Resources

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)
- [TypeScript Guide (works with JS too)](https://zod.dev/?id=typescript)

---

For more examples, check the validation schemas in:
- `src/validations/product.validation.js`
- `src/validations/category.validation.js`
- `src/validations/auth.validation.js`
- `src/validations/user.validation.js`
