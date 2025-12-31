# Category Schema Documentation

Complete documentation for the Category collection in Firestore for E-Commerce Clothing Store.

## Collection Name: `categories`

Document ID: Auto-generated unique category ID

---

## Fields Reference

### Required Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `categoryId` | String | Unique category identifier (auto-generated) | `"cat_abc123"` |
| `categoryName` | String | Category display name | `"Men"`, `"Women"`, `"Kids"` |
| `categorySlug` | String | URL-friendly category identifier | `"men"`, `"women"`, `"kids"` |
| `description` | String | Category description | `"Men's clothing and accessories"` |
| `subCategories` | Array\<Object\> | Array of subcategory objects | See SubCategory Schema below |
| `isActive` | Boolean | Category is visible to customers | `true`, `false` |
| `displayOrder` | Number | Order in which categories appear | `1`, `2`, `3` |
| `createdAt` | String (ISO) | Category creation timestamp | `"2025-12-31T10:00:00.000Z"` |
| `updatedAt` | String (ISO) | Last update timestamp | `"2025-12-31T10:00:00.000Z"` |

### Optional Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `imageUrl` | String | Category banner/thumbnail image | `"https://example.com/categories/men.jpg"` |

---

## SubCategory Schema

Each subcategory object in the `subCategories` array:

```json
{
  "subCategoryId": "subcat_casual_123",
  "subCategoryName": "Casual",
  "subCategorySlug": "casual",
  "description": "Casual wear for everyday use",
  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2025-12-31T10:00:00.000Z"
}
```

### SubCategory Fields

| Field | Type | Description |
|-------|------|-------------|
| `subCategoryId` | String | Unique subcategory identifier |
| `subCategoryName` | String | Display name of subcategory |
| `subCategorySlug` | String | URL-friendly subcategory identifier |
| `description` | String | Subcategory description |
| `createdAt` | String (ISO) | Subcategory creation timestamp |
| `updatedAt` | String (ISO) | Last update timestamp (optional) |

---

## Category Examples

### Men's Clothing Category

```json
{
  "categoryId": "cat_men_001",
  "categoryName": "Men",
  "categorySlug": "men",
  "description": "Men's clothing and accessories",
  "imageUrl": "https://example.com/images/categories/men-banner.jpg",
  "subCategories": [
    {
      "subCategoryId": "subcat_men_casual_001",
      "subCategoryName": "Casual",
      "subCategorySlug": "casual",
      "description": "Casual wear for everyday comfort",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_men_formal_001",
      "subCategoryName": "Formal",
      "subCategorySlug": "formal",
      "description": "Professional and formal attire",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_men_ethnic_001",
      "subCategoryName": "Ethnic",
      "subCategorySlug": "ethnic",
      "description": "Traditional and ethnic wear",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_men_sports_001",
      "subCategoryName": "Sports",
      "subCategorySlug": "sports",
      "description": "Activewear and sportswear",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_men_winter_001",
      "subCategoryName": "Winter",
      "subCategorySlug": "winter",
      "description": "Winter wear and warm clothing",
      "createdAt": "2025-12-31T10:00:00.000Z"
    }
  ],
  "isActive": true,
  "displayOrder": 1,
  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2025-12-31T10:00:00.000Z"
}
```

### Women's Clothing Category

```json
{
  "categoryId": "cat_women_001",
  "categoryName": "Women",
  "categorySlug": "women",
  "description": "Women's fashion and clothing",
  "imageUrl": "https://example.com/images/categories/women-banner.jpg",
  "subCategories": [
    {
      "subCategoryId": "subcat_women_western_001",
      "subCategoryName": "Western",
      "subCategorySlug": "western",
      "description": "Western wear and contemporary fashion",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_women_ethnic_001",
      "subCategoryName": "Ethnic",
      "subCategorySlug": "ethnic",
      "description": "Traditional ethnic wear and sarees",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_women_party_001",
      "subCategoryName": "Party",
      "subCategorySlug": "party",
      "description": "Party wear and evening dresses",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_women_casual_001",
      "subCategoryName": "Casual",
      "subCategorySlug": "casual",
      "description": "Casual everyday wear",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_women_maternity_001",
      "subCategoryName": "Maternity",
      "subCategorySlug": "maternity",
      "description": "Maternity wear and nursing clothes",
      "createdAt": "2025-12-31T10:00:00.000Z"
    }
  ],
  "isActive": true,
  "displayOrder": 2,
  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2025-12-31T10:00:00.000Z"
}
```

### Kids' Clothing Category

```json
{
  "categoryId": "cat_kids_001",
  "categoryName": "Kids",
  "categorySlug": "kids",
  "description": "Children's clothing and accessories",
  "imageUrl": "https://example.com/images/categories/kids-banner.jpg",
  "subCategories": [
    {
      "subCategoryId": "subcat_kids_boys_001",
      "subCategoryName": "Boys",
      "subCategorySlug": "boys",
      "description": "Boys' clothing and apparel",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_kids_girls_001",
      "subCategoryName": "Girls",
      "subCategorySlug": "girls",
      "description": "Girls' clothing and apparel",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_kids_infants_001",
      "subCategoryName": "Infants",
      "subCategorySlug": "infants",
      "description": "Infant and baby clothing",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_kids_school_001",
      "subCategoryName": "School",
      "subCategorySlug": "school",
      "description": "School uniforms and backpacks",
      "createdAt": "2025-12-31T10:00:00.000Z"
    }
  ],
  "isActive": true,
  "displayOrder": 3,
  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2025-12-31T10:00:00.000Z"
}
```

### Ethnic Clothing Category (with Punjabi/Folk Subcategories)

```json
{
  "categoryId": "cat_ethnic_001",
  "categoryName": "Ethnic Wear",
  "categorySlug": "ethnic",
  "description": "Traditional ethnic and cultural clothing",
  "imageUrl": "https://example.com/images/categories/ethnic-banner.jpg",
  "subCategories": [
    {
      "subCategoryId": "subcat_ethnic_folk_001",
      "subCategoryName": "Folk",
      "subCategorySlug": "folk",
      "description": "Traditional folk wear from different regions",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_ethnic_punjabi_001",
      "subCategoryName": "Punjabi",
      "subCategorySlug": "punjabi",
      "description": "Punjabi suits and traditional attire",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_ethnic_bhangra_001",
      "subCategoryName": "Bhangra",
      "subCategorySlug": "bhangra",
      "description": "Bhangra performance and festive wear",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_ethnic_kurta_001",
      "subCategoryName": "Kurta",
      "subCategorySlug": "kurta",
      "description": "Kurtas and traditional tunics",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_ethnic_saree_001",
      "subCategoryName": "Saree",
      "subCategorySlug": "saree",
      "description": "Traditional sarees and drapes",
      "createdAt": "2025-12-31T10:00:00.000Z"
    }
  ],
  "isActive": true,
  "displayOrder": 4,
  "createdAt": "2025-12-31T10:00:00.000Z",
  "updatedAt": "2025-12-31T10:00:00.000Z"
}
```

---

## Common SubCategory Examples by Category

### Men's SubCategories
- `casual` - Casual wear (T-shirts, jeans, shorts)
- `formal` - Formal wear (suits, dress shirts, trousers)
- `ethnic` - Ethnic wear (kurtas, sherwanis, dhotis)
- `sports` - Sportswear (activewear, gym clothes)
- `winter` - Winter wear (jackets, sweaters, coats)

### Women's SubCategories
- `western` - Western wear (tops, jeans, dresses)
- `ethnic` - Ethnic wear (sarees, lehengas, salwar kameez)
- `party` - Party wear (evening gowns, cocktail dresses)
- `casual` - Casual wear (everyday clothing)
- `maternity` - Maternity wear

### Kids' SubCategories
- `boys` - Boys' clothing
- `girls` - Girls' clothing
- `infants` - Infant clothing (0-2 years)
- `school` - School uniforms

### Ethnic Wear SubCategories
- `folk` - Folk wear from different regions
- `punjabi` - Punjabi suits and traditional attire
- `bhangra` - Bhangra performance wear
- `kurta` - Kurtas and tunics
- `saree` - Sarees and drapes

---

## Validation Rules

### On Category Creation

**Required:**
- `categoryName` - Not empty, max 100 characters
- `categorySlug` - Not empty, must be unique, only lowercase letters, numbers, and hyphens
- `displayOrder` - Positive integer

**Optional but Recommended:**
- `description` - Max 500 characters
- `imageUrl` - Valid URL format
- `subCategories` - Array of subcategory objects

### On Category Update

- Cannot change `categoryId`
- Cannot change `createdAt`
- `categorySlug` must remain unique if updated
- `updatedAt` is automatically set to current timestamp

### On SubCategory Creation

**Required:**
- `subCategoryName` - Not empty, max 100 characters
- `subCategorySlug` - Not empty, unique within category, only lowercase letters, numbers, and hyphens

### Slug Format Rules

- Only lowercase letters (a-z)
- Numbers (0-9)
- Hyphens (-) for word separation
- No spaces, special characters, or uppercase letters
- Examples: `"men"`, `"casual-wear"`, `"punjabi-suits"`

---

## Relationships with Products

Products reference categories using the `category` and `subCategory` fields:

```javascript
// In Product document
{
  "category": "men",           // categorySlug from categories collection
  "subCategory": "ethnic",      // subCategorySlug from category's subCategories array
  "productType": "kurta"
}
```

### Validation Flow

1. When creating/updating a product, validate that:
   - The `category` slug exists in the categories collection
   - The `subCategory` slug exists in that category's subCategories array
2. When deleting a category/subcategory:
   - Check if any products reference it
   - Prevent deletion if products exist (or reassign products first)

---

## Indexes Required

For optimal query performance, create these Firestore indexes:

### Single Field Indexes
- `categorySlug` (ascending)
- `isActive` (ascending)
- `displayOrder` (ascending)

### Composite Indexes
- `isActive` (ascending) + `displayOrder` (ascending)

---

## API Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Category Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/categories` | GET | No | Get all categories |
| `/api/categories/:id` | GET | No | Get category by ID |
| `/api/categories/slug/:slug` | GET | No | Get category by slug |
| `/api/categories` | POST | Admin | Create category |
| `/api/categories/:id` | PUT | Admin | Update category |
| `/api/categories/:id` | DELETE | Admin | Delete category |

### SubCategory Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/categories/:categoryId/subcategories` | GET | No | Get all subcategories |
| `/api/categories/:categoryId/subcategories` | POST | Admin | Add subcategory |
| `/api/categories/:categoryId/subcategories/:subCategoryId` | PUT | Admin | Update subcategory |
| `/api/categories/:categoryId/subcategories/:subCategoryId` | DELETE | Admin | Remove subcategory |

---

## Best Practices

1. **Use slugs for URLs** - Always use `categorySlug` and `subCategorySlug` in frontend URLs for SEO
2. **Validate references** - Always validate category/subcategory combinations when creating products
3. **Soft delete** - Set `isActive: false` instead of deleting categories
4. **Unique slugs** - Ensure category and subcategory slugs are unique
5. **Display order** - Use `displayOrder` to control category sorting in navigation
6. **Check dependencies** - Before deleting, check if products reference the category/subcategory
7. **Update timestamps** - Always update `updatedAt` when modifying categories or subcategories
8. **Image optimization** - Store multiple sizes of category images for performance
9. **Descriptive names** - Use clear, user-friendly category and subcategory names
10. **Consistent naming** - Follow consistent naming conventions across all categories

---

## Example Queries

### Get All Active Categories Sorted by Display Order

```javascript
const categories = await db.collection('categories')
  .where('isActive', '==', true)
  .orderBy('displayOrder', 'asc')
  .get();
```

### Get Category by Slug

```javascript
const category = await db.collection('categories')
  .where('categorySlug', '==', 'men')
  .limit(1)
  .get();
```

### Get Products in Category and SubCategory

```javascript
const products = await db.collection('products')
  .where('category', '==', 'men')
  .where('subCategory', '==', 'ethnic')
  .where('isActive', '==', true)
  .get();
```

---

## Migration Notes

If migrating from old schema:

1. Rename `name` to `categoryName`
2. Add `categorySlug` (generate from name)
3. Create `subCategories` array from existing data
4. Add `displayOrder` field (default to creation order)
5. Add `isActive` field (default to `true`)
6. Update all product references to use slugs instead of IDs

---

## Common Use Cases

### Navigation Menu

Fetch all active categories with subcategories for building navigation:

```javascript
const categories = await db.collection('categories')
  .where('isActive', '==', true)
  .orderBy('displayOrder', 'asc')
  .get();

// Use categoryName and subCategoryName for display
// Use categorySlug and subCategorySlug for URLs
```

### Product Filtering

Get all products in a specific category/subcategory:

```javascript
// URL: /products/men/ethnic
const products = await db.collection('products')
  .where('category', '==', 'men')        // categorySlug
  .where('subCategory', '==', 'ethnic')  // subCategorySlug
  .where('isActive', '==', true)
  .get();
```

### Admin Dashboard

Get category with product count:

```javascript
const categoryDoc = await db.collection('categories').doc(categoryId).get();
const category = categoryDoc.data();

const productsCount = await db.collection('products')
  .where('category', '==', category.categorySlug)
  .count()
  .get();
```

---

For implementation details, see:
- [Category Controller](../src/controllers/category.controller.js)
- [Category Routes](../src/routes/category.routes.js)
- [Product Schema](PRODUCT_SCHEMA.md)
- [API Documentation](API_DOCUMENTATION.md)
