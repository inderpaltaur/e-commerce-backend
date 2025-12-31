# Product Schema Documentation

Complete documentation for the Product collection in Firestore for E-Commerce Clothing Store.

## Collection Name: `products`

Document ID: Auto-generated unique product ID

---

## Fields Reference

### Required Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `productId` | String | Unique product identifier (auto-generated) | `"prod_abc123"` |
| `productName` | String | Product display name | `"Cotton T-Shirt"` |
| `productDescription` | String | Detailed product description | `"Comfortable cotton t-shirt..."` |
| `category` | String | Main product category | `"men"`, `"women"`, `"kids"` |
| `subCategory` | String | Product subcategory | `"casual"`, `"ethnic"`, `"formal"` |
| `productType` | String | Specific product type | `"t-shirt"`, `"jeans"`, `"kurta"` |
| `price` | Number | Base price (before discount) | `999.00` |
| `currencyType` | String | Currency code | `"INR"`, `"USD"` |
| `sizes` | Array\<String\> | Available sizes | `["S", "M", "L", "XL"]` |
| `colors` | Array\<Object\> | Available colors with details | See Color Schema below |
| `images` | Array\<String\> | Product image URLs | `["url1", "url2"]` |
| `units` | Number | Current stock/inventory | `150` |
| `soldCount` | Number | Total units sold | `45` |
| `isActive` | Boolean | Product is available for sale | `true`, `false` |
| `createdAt` | String (ISO) | Product creation timestamp | `"2025-12-31T10:00:00.000Z"` |
| `updatedAt` | String (ISO) | Last update timestamp | `"2025-12-31T10:00:00.000Z"` |

### Optional Fields

| Field Name | Type | Description | Example |
|------------|------|-------------|---------|
| `offerType` | String | Discount type (enum) | `"percentage"`, `"amount"`, `"none"` |
| `offerValue` | Number | Discount value | `20` (for 20% or ₹20) |
| `tax` | Number | Tax percentage | `18` (for 18% GST) |
| `tags` | Array\<String\> | Search/filter tags | `["trending", "summer", "casual"]` |
| `rating` | Object | Product rating details | See Rating Schema below |
| `brand` | String | Brand name | `"Nike"`, `"Adidas"` |
| `material` | String | Fabric/material type | `"100% Cotton"`, `"Polyester Blend"` |
| `careInstructions` | String | How to care for the product | `"Machine wash cold..."` |
| `isFeatured` | Boolean | Show in featured section | `true`, `false` |
| `weight` | Number | Product weight in grams | `250` |
| `dimensions` | Object | Product dimensions | `{"length": 70, "width": 50, "height": 2}` |
| `sku` | String | Stock Keeping Unit | `"MEN-TSH-BLK-M-001"` |
| `vendor` | String | Vendor/supplier name | `"ABC Textiles"` |
| `countryOfOrigin` | String | Manufacturing country | `"India"`, `"China"` |

---

## Enum Values

### category
- `"men"` - Men's clothing
- `"women"` - Women's clothing
- `"kids"` - Children's clothing
- `"unisex"` - Unisex products

### subCategory (Examples)
**Men:**
- `"casual"` - Casual wear
- `"formal"` - Formal wear
- `"ethnic"` - Traditional/ethnic wear
- `"sports"` - Sportswear
- `"winter"` - Winter wear

**Women:**
- `"western"` - Western wear
- `"ethnic"` - Ethnic/traditional wear
- `"party"` - Party wear
- `"casual"` - Casual wear
- `"maternity"` - Maternity wear

**Kids:**
- `"boys"` - Boys' clothing
- `"girls"` - Girls' clothing
- `"infants"` - Infant clothing
- `"school"` - School uniforms

### productType (Examples)
- `"t-shirt"` - T-Shirts
- `"shirt"` - Shirts
- `"jeans"` - Jeans
- `"kurta"` - Kurtas
- `"dress"` - Dresses
- `"saree"` - Sarees
- `"punjabi"` - Punjabi suits
- `"folk"` - Folk wear
- `"bhangra"` - Bhangra attire
- `"jacket"` - Jackets
- `"sweater"` - Sweaters
- `"shorts"` - Shorts
- `"skirt"` - Skirts

### offerType
- `"percentage"` - Percentage discount (e.g., 20% off)
- `"amount"` - Fixed amount discount (e.g., ₹100 off)
- `"none"` - No discount

### currencyType
- `"INR"` - Indian Rupees
- `"USD"` - US Dollars
- `"EUR"` - Euros
- `"GBP"` - British Pounds

---

## Color Schema

Each color object in the `colors` array:

```json
{
  "colorName": "Black",
  "colorCode": "#000000",
  "colorImage": "https://example.com/black-variant.jpg",
  "stock": 25
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `colorName` | String | Display name of color |
| `colorCode` | String | Hex color code for preview |
| `colorImage` | String | URL to product image in this color |
| `stock` | Number | Available units in this color |

---

## Rating Schema

```json
{
  "average": 4.5,
  "count": 128,
  "distribution": {
    "5": 80,
    "4": 30,
    "3": 10,
    "2": 5,
    "1": 3
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `average` | Number | Average rating (0-5) |
| `count` | Number | Total number of ratings |
| `distribution` | Object | Count of each star rating |

---

## Complete Example Document

```json
{
  "productId": "prod_abc123xyz",
  "productName": "Cotton Casual T-Shirt",
  "productDescription": "Comfortable 100% cotton t-shirt perfect for everyday wear. Breathable fabric with modern fit. Available in multiple colors and sizes.",
  "category": "men",
  "subCategory": "casual",
  "productType": "t-shirt",
  "price": 999,
  "currencyType": "INR",
  "offerType": "percentage",
  "offerValue": 20,
  "tax": 18,
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "colors": [
    {
      "colorName": "Black",
      "colorCode": "#000000",
      "colorImage": "https://example.com/images/tshirt-black.jpg",
      "stock": 50
    },
    {
      "colorName": "White",
      "colorCode": "#FFFFFF",
      "colorImage": "https://example.com/images/tshirt-white.jpg",
      "stock": 45
    },
    {
      "colorName": "Navy Blue",
      "colorCode": "#000080",
      "colorImage": "https://example.com/images/tshirt-navy.jpg",
      "stock": 30
    }
  ],
  "images": [
    "https://example.com/images/tshirt-main.jpg",
    "https://example.com/images/tshirt-side.jpg",
    "https://example.com/images/tshirt-back.jpg",
    "https://example.com/images/tshirt-detail.jpg"
  ],
  "units": 125,
  "soldCount": 78,
  "tags": ["trending", "summer", "casual", "cotton", "comfortable"],
  "rating": {
    "average": 4.5,
    "count": 128,
    "distribution": {
      "5": 80,
      "4": 30,
      "3": 10,
      "2": 5,
      "1": 3
    }
  },
  "brand": "Urban Fashion",
  "material": "100% Cotton",
  "careInstructions": "Machine wash cold with like colors. Tumble dry low. Do not bleach.",
  "weight": 200,
  "dimensions": {
    "length": 72,
    "width": 52,
    "height": 2
  },
  "sku": "MEN-TSH-BLK-M-001",
  "vendor": "Cotton Crafts Ltd",
  "countryOfOrigin": "India",
  "isFeatured": true,
  "isActive": true,
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2025-12-31T14:30:00.000Z"
}
```

---

## Calculated Fields

### finalPrice (Calculated at runtime)

```javascript
const finalPrice = offerType === 'percentage'
  ? price - (price * offerValue / 100)
  : offerType === 'amount'
  ? price - offerValue
  : price;
```

### priceWithTax (Calculated at runtime)

```javascript
const priceWithTax = finalPrice + (finalPrice * tax / 100);
```

### inStock (Calculated at runtime)

```javascript
const inStock = units > 0;
```

### totalColorStock (Calculated at runtime)

```javascript
const totalColorStock = colors.reduce((sum, color) => sum + color.stock, 0);
```

---

## Inventory Management

### Stock Tracking

Products track inventory at two levels:

1. **Overall Stock (`units`)**: Total available units across all colors
2. **Color-specific Stock (`colors[].stock`)**: Units available for each color

**Rules:**
- `units` should equal sum of all `colors[].stock`
- When order is placed, reduce both `units` and specific color stock
- When `units` reaches 0, product shows as "Out of Stock"
- Specific colors with stock 0 are not selectable

### Size Availability

Sizes are stored as an array. All sizes listed are assumed to be available if overall stock > 0.

**For size-specific inventory:**
Consider creating a separate `variants` collection or adding a `sizeColorMatrix`:

```json
{
  "variants": [
    {
      "size": "M",
      "color": "Black",
      "stock": 10,
      "sku": "MEN-TSH-BLK-M-001"
    },
    {
      "size": "L",
      "color": "Black",
      "stock": 15,
      "sku": "MEN-TSH-BLK-L-001"
    }
  ]
}
```

---

## Validation Rules

### On Product Creation

**Required:**
- `productName` - Not empty, max 200 characters
- `productDescription` - Not empty, max 2000 characters
- `category` - Must match valid category
- `subCategory` - Must match valid subcategory for the category
- `productType` - Not empty
- `price` - Positive number, max 2 decimals
- `currencyType` - Valid currency code
- `sizes` - Array with at least 1 size
- `colors` - Array with at least 1 color
- `images` - Array with at least 1 image URL
- `units` - Non-negative integer

**Optional but Recommended:**
- `tax` - If provided, must be 0-100
- `offerValue` - If offerType is not 'none', must be positive
- `rating` - If provided, average must be 0-5

### On Product Update

- Cannot reduce `soldCount`
- Cannot change `productId`
- `updatedAt` is automatically set to current timestamp

---

## Indexes Required

For optimal query performance, create these Firestore indexes:

### Single Field Indexes
- `category` (ascending)
- `subCategory` (ascending)
- `productType` (ascending)
- `isActive` (ascending)
- `isFeatured` (ascending)
- `price` (ascending/descending)
- `rating.average` (descending)
- `soldCount` (descending)
- `createdAt` (descending)

### Composite Indexes
- `category` (ascending) + `isActive` (ascending) + `price` (ascending)
- `category` (ascending) + `subCategory` (ascending) + `isActive` (ascending)
- `isActive` (ascending) + `isFeatured` (ascending) + `createdAt` (descending)
- `category` (ascending) + `rating.average` (descending)

---

## Related Collections

### categories

```json
{
  "categoryId": "cat_men",
  "categoryName": "Men",
  "categorySlug": "men",
  "description": "Men's clothing and accessories",
  "imageUrl": "https://example.com/categories/men.jpg",
  "subCategories": [
    {
      "subCategoryId": "subcat_casual",
      "subCategoryName": "Casual",
      "subCategorySlug": "casual",
      "description": "Casual wear for men"
    },
    {
      "subCategoryId": "subcat_ethnic",
      "subCategoryName": "Ethnic",
      "subCategorySlug": "ethnic",
      "description": "Traditional ethnic wear"
    }
  ],
  "isActive": true,
  "displayOrder": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### productReviews (Separate Collection)

```json
{
  "reviewId": "rev_abc123",
  "productId": "prod_abc123xyz",
  "userId": "user_xyz789",
  "userName": "John Doe",
  "rating": 5,
  "reviewTitle": "Great product!",
  "reviewText": "Very comfortable and good quality.",
  "images": ["review-image-1.jpg"],
  "isVerifiedPurchase": true,
  "helpfulCount": 15,
  "createdAt": "2025-12-31T10:00:00.000Z"
}
```

---

## API Endpoints

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

### Product Endpoints Summary

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PUT /api/products/:id/stock` - Update stock (Admin)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/trending` - Get trending products (by soldCount)

---

## Best Practices

1. **Always validate** category and subcategory combinations
2. **Update soldCount** when orders are completed (not just placed)
3. **Maintain stock accuracy** by reducing stock on order placement
4. **Use transactions** for stock updates to prevent overselling
5. **Store multiple image sizes** for performance (thumbnail, medium, large)
6. **Update rating** asynchronously when new reviews are added
7. **Set isActive to false** instead of deleting products
8. **Use SKU** for inventory management and tracking
9. **Validate color stock** against overall units
10. **Update updatedAt** timestamp on every modification

---

## Example Queries

### Get Active Products in Category with Price Range

```javascript
const products = await db.collection('products')
  .where('category', '==', 'men')
  .where('isActive', '==', true)
  .where('price', '>=', 500)
  .where('price', '<=', 2000)
  .orderBy('price', 'asc')
  .limit(20)
  .get();
```

### Get Featured Products

```javascript
const products = await db.collection('products')
  .where('isActive', '==', true)
  .where('isFeatured', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();
```

### Get Trending Products

```javascript
const products = await db.collection('products')
  .where('isActive', '==', true)
  .orderBy('soldCount', 'desc')
  .limit(20)
  .get();
```

---

## Migration Notes

If migrating from old schema:
1. Rename fields to match new naming convention
2. Convert `stock` to `units`
3. Create `colors` array from existing color data
4. Add default values for new required fields
5. Set `isActive` to `true` for all existing products
6. Initialize `soldCount` to 0 if not present
7. Convert category strings to match new enum values

---

For implementation details, see:
- [Product Controller](../src/controllers/product.controller.js)
- [Product Routes](../src/routes/product.routes.js)
- [API Documentation](API_DOCUMENTATION.md)
