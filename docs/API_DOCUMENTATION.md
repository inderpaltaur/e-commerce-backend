# E-Commerce API Documentation

Complete API documentation for the E-Commerce Clothing Store REST API.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using Firebase ID tokens. Include the token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

---

## Table of Contents
1. [User Schema](#user-schema)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Product Endpoints](#product-endpoints)
5. [Category Endpoints](#category-endpoints)
6. [Order Endpoints](#order-endpoints)

---

## User Schema

### Firestore Collection: `users`

| Field | Type | Required | Description | Enum Values |
|-------|------|----------|-------------|-------------|
| `uid` | String | Yes | Unique user identifier (Firebase Auth UID) | - |
| `name` | String | Yes | User's full name | - |
| `email` | String | Yes | User's email address | - |
| `phoneNumber` | String | No | User's phone number | - |
| `photoURL` | String | No | User's profile photo URL | - |
| `role` | String | Yes | User role | `customer`, `admin` |
| `authProvider` | String | Yes | Authentication provider used | `Email`, `Google`, `Facebook`, etc. |
| `isPhoneVerified` | Boolean | Yes | Phone verification status | `true`, `false` |
| `isEmailVerified` | Boolean | Yes | Email verification status | `true`, `false` |
| `accountStatus` | String | Yes | Account status | `active`, `blocked`, `suspended` |
| `lastLogin` | String (ISO) | Yes | Last login timestamp | - |
| `address` | Object/String | No | Shipping address (collected during order) | - |
| `wishlist` | Array | Yes | Array of product IDs | - |
| `createdAt` | String (ISO) | Yes | Account creation timestamp | - |
| `updatedAt` | String (ISO) | Yes | Last update timestamp | - |

### Address Object Structure
```json
{
  "street": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Create a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "photoURL": "https://example.com/photo.jpg",
  "authProvider": "Email"
}
```

**Required Fields:**
- `email` (valid email)
- `password` (min 6 characters)
- `name`

**Optional Fields:**
- `phoneNumber` (valid mobile number)
- `photoURL` (valid URL)
- `authProvider` (defaults to "Email")

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Validate user credentials and update last login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User found. Use Firebase client SDK to complete login.",
  "data": {
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "accountStatus": "active"
  }
}
```

**Error Response (403) - Account Not Active:**
```json
{
  "success": false,
  "message": "Account is blocked. Please contact support."
}
```

---

### 3. Social Authentication
**POST** `/auth/social-auth`

Handle Google/Facebook/Other social login.

**Request Body:**
```json
{
  "uid": "firebase-uid-from-social-auth",
  "email": "user@example.com",
  "name": "John Doe",
  "authProvider": "Google",
  "photoURL": "https://example.com/photo.jpg",
  "phoneNumber": "+1234567890"
}
```

**Required Fields:**
- `uid`
- `email`
- `name`
- `authProvider`

**Response (200/201):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "uid": "firebase-uid-here",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "accountStatus": "active",
    "wishlist": [],
    ...
  }
}
```

---

### 4. Verify Token
**POST** `/auth/verify`

Verify if a Firebase ID token is valid.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    ...
  }
}
```

---

### 5. Generate Custom Token
**POST** `/auth/custom-token`

Generate a custom Firebase token for server-side authentication flows.

**Request Body:**
```json
{
  "uid": "user-firebase-uid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Custom token generated successfully",
  "data": {
    "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "uid": "user-firebase-uid"
  }
}
```

---

### 6. Refresh Token
**POST** `/auth/refresh`

Validate token and return fresh user data.

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "uid": "user-firebase-uid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    ...
  }
}
```

---

### 7. Link OAuth Provider
**POST** `/auth/link-provider`

Link an additional OAuth provider to the existing account.

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Request Body:**
```json
{
  "uid": "user-firebase-uid",
  "provider": "Facebook",
  "providerUid": "facebook-user-id-123",
  "email": "user@facebook.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Facebook linked successfully",
  "data": {
    "linkedProviders": [
      {
        "provider": "Google",
        "providerUid": "google-123",
        "email": "user@gmail.com",
        "linkedAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "provider": "Facebook",
        "providerUid": "facebook-user-id-123",
        "email": "user@facebook.com",
        "linkedAt": "2025-12-31T00:00:00.000Z"
      }
    ]
  }
}
```

**Error (400) - Provider Already Linked:**
```json
{
  "success": false,
  "message": "Facebook is already linked to this account"
}
```

---

### 8. Unlink OAuth Provider
**POST** `/auth/unlink-provider`

Remove an OAuth provider from the account.

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Request Body:**
```json
{
  "uid": "user-firebase-uid",
  "provider": "Facebook"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Facebook unlinked successfully",
  "data": {
    "linkedProviders": [
      {
        "provider": "Google",
        "providerUid": "google-123",
        "email": "user@gmail.com",
        "linkedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error (400) - Last Provider:**
```json
{
  "success": false,
  "message": "Cannot unlink the only authentication method"
}
```

---

### 9. Get Linked Providers
**GET** `/auth/linked-providers`

Get all OAuth providers linked to the account.

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "primaryProvider": "Google",
    "linkedProviders": [
      {
        "provider": "Google",
        "providerUid": "google-123",
        "email": "user@gmail.com",
        "linkedAt": "2025-01-01T00:00:00.000Z"
      },
      {
        "provider": "Facebook",
        "providerUid": "facebook-456",
        "email": "user@facebook.com",
        "linkedAt": "2025-06-15T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 10. Revoke All Tokens
**POST** `/auth/revoke-tokens`

Revoke all refresh tokens for the user (logout from all devices).

**Auth Required:** Yes

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All tokens revoked successfully",
  "data": {
    "tokensValidAfter": "2025-12-31T10:00:00.000Z"
  }
}
```

---

## User Endpoints

### 1. Get User Profile
**GET** `/users/profile`

Get the authenticated user's profile.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "uid": "firebase-uid",
    "name": "John Doe",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "photoURL": "https://example.com/photo.jpg",
    "role": "customer",
    "authProvider": "Email",
    "isPhoneVerified": false,
    "isEmailVerified": true,
    "accountStatus": "active",
    "lastLogin": "2025-12-31T10:30:00.000Z",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "wishlist": ["product-id-1", "product-id-2"],
    "createdAt": "2025-01-01T08:00:00.000Z",
    "updatedAt": "2025-12-31T10:30:00.000Z"
  }
}
```

---

### 2. Update User Profile
**PUT** `/users/profile`

Update the authenticated user's profile.

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phoneNumber": "+0987654321",
  "photoURL": "https://example.com/new-photo.jpg",
  "address": {
    "street": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  }
}
```

**All Fields Optional**

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-id",
    ...
  }
}
```

---

### 3. Get Wishlist
**GET** `/users/wishlist`

Get user's wishlist with full product details.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "product-id-1",
      "name": "Cotton T-Shirt",
      "price": 29.99,
      "imageUrl": "https://example.com/tshirt.jpg",
      ...
    },
    {
      "id": "product-id-2",
      "name": "Denim Jeans",
      "price": 79.99,
      ...
    }
  ]
}
```

---

### 4. Add to Wishlist
**POST** `/users/wishlist`

Add a product to user's wishlist.

**Auth Required:** Yes

**Request Body:**
```json
{
  "productId": "product-id-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    "wishlist": ["product-id-1", "product-id-2", "product-id-here"]
  }
}
```

**Error Response (400) - Already in Wishlist:**
```json
{
  "success": false,
  "message": "Product already in wishlist"
}
```

---

### 5. Remove from Wishlist
**DELETE** `/users/wishlist/:productId`

Remove a product from user's wishlist.

**Auth Required:** Yes

**URL Parameters:**
- `productId` - ID of product to remove

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "data": {
    "wishlist": ["product-id-1"]
  }
}
```

---

### 6. Verify Phone Number
**POST** `/users/verify-phone`

Mark user's phone number as verified.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

---

### 7. Verify Email
**POST** `/users/verify-email`

Mark user's email as verified.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 8. Get All Users (Admin)
**GET** `/users`

Get all users (admin only).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `limit` (default: 50) - Number of users to return
- `accountStatus` - Filter by status: `active`, `blocked`, `suspended`
- `role` - Filter by role: `customer`, `admin`

**Example:**
```
GET /users?limit=20&accountStatus=active&role=customer
```

**Response (200):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "user-id-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "accountStatus": "active",
      ...
    },
    ...
  ]
}
```

---

### 9. Set Admin Role (Admin)
**PUT** `/users/:uid/set-admin`

Grant admin privileges to a user.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `uid` - User's Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Admin role set successfully"
}
```

---

### 10. Update Account Status (Admin)
**PUT** `/users/:uid/account-status`

Update a user's account status.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `uid` - User's Firebase UID

**Request Body:**
```json
{
  "accountStatus": "blocked"
}
```

**Valid Status Values:**
- `active`
- `blocked`
- `suspended`

**Response (200):**
```json
{
  "success": true,
  "message": "Account status updated successfully"
}
```

---

## Product Endpoints

### 1. Get All Products
**GET** `/products`

Get all products with advanced filtering and search (public access).

**Auth Required:** No

**Query Parameters:**
- `limit` (default: 50) - Number of products to return
- `category` - Filter by category slug (`men`, `women`, `kids`, `ethnic`)
- `subCategory` - Filter by subcategory slug
- `productType` - Filter by product type
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `tags` - Filter by tag (single tag)
- `isFeatured` - Filter featured products (`true`/`false`)
- `isActive` - Filter by active status (`true`/`false`/`all`, default: `true`)
- `sortBy` - Sort field (`price`, `createdAt`, `soldCount`, `rating.average`, default: `createdAt`)
- `sortOrder` - Sort order (`asc`/`desc`, default: `desc`)
- `search` - Search in product name, description, and tags

**Example:**
```
GET /products?category=men&subCategory=ethnic&minPrice=500&maxPrice=2000&sortBy=price&sortOrder=asc&limit=20
GET /products?search=cotton&isFeatured=true&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "prod_abc123",
      "productId": "prod_abc123",
      "productName": "Cotton Casual Kurta",
      "productDescription": "Comfortable cotton kurta for everyday wear",
      "category": "men",
      "subCategory": "ethnic",
      "productType": "kurta",
      "price": 999,
      "finalPrice": 799.20,
      "priceWithTax": 943.06,
      "currencyType": "INR",
      "offerType": "percentage",
      "offerValue": 20,
      "tax": 18,
      "sizes": ["S", "M", "L", "XL"],
      "colors": [
        {
          "colorName": "White",
          "colorCode": "#FFFFFF",
          "colorImage": "https://example.com/kurta-white.jpg",
          "stock": 50
        }
      ],
      "images": ["https://example.com/kurta1.jpg", "https://example.com/kurta2.jpg"],
      "units": 125,
      "soldCount": 78,
      "inStock": true,
      "tags": ["ethnic", "casual", "cotton"],
      "rating": {
        "average": 4.5,
        "count": 128,
        "distribution": {"5": 80, "4": 30, "3": 10, "2": 5, "1": 3}
      },
      "brand": "Urban Fashion",
      "isFeatured": true,
      "isActive": true,
      "createdAt": "2025-12-01T10:00:00.000Z",
      "updatedAt": "2025-12-31T14:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Product by ID
**GET** `/products/:id`

Get a single product by ID with calculated fields (public access).

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod_abc123",
    "productId": "prod_abc123",
    "productName": "Cotton Casual Kurta",
    "productDescription": "Comfortable cotton kurta...",
    "category": "men",
    "subCategory": "ethnic",
    "productType": "kurta",
    "price": 999,
    "finalPrice": 799.20,
    "priceWithTax": 943.06,
    "currencyType": "INR",
    "offerType": "percentage",
    "offerValue": 20,
    "tax": 18,
    "sizes": ["S", "M", "L", "XL"],
    "colors": [...],
    "images": [...],
    "units": 125,
    "soldCount": 78,
    "inStock": true,
    "rating": {...},
    "brand": "Urban Fashion",
    "material": "100% Cotton",
    "careInstructions": "Machine wash cold...",
    "weight": 200,
    "dimensions": {"length": 72, "width": 52, "height": 2},
    "sku": "MEN-KURTA-WHT-M-001",
    "vendor": "Cotton Crafts Ltd",
    "countryOfOrigin": "India",
    "isFeatured": true,
    "isActive": true,
    "createdAt": "2025-12-01T10:00:00.000Z",
    "updatedAt": "2025-12-31T14:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 3. Get Products by Category
**GET** `/products/category/:category`

Get all products in a specific category (public access).

**Auth Required:** No

**URL Parameters:**
- `category` - Category slug (`men`, `women`, `kids`, `ethnic`)

**Query Parameters:**
- `limit` (default: 50)
- `subCategory` - Filter by subcategory
- `isActive` (default: `true`) - Filter by active status

**Response:** Same as Get All Products

---

### 4. Get Featured Products
**GET** `/products/featured`

Get featured products (public access).

**Auth Required:** No

**Query Parameters:**
- `limit` (default: 10)

**Response:** Same as Get All Products

**Example:**
```
GET /products/featured?limit=20
```

---

### 5. Get Trending Products
**GET** `/products/trending`

Get trending products sorted by sold count (public access).

**Auth Required:** No

**Query Parameters:**
- `limit` (default: 20)

**Response:** Same as Get All Products

**Example:**
```
GET /products/trending?limit=15
```

---

### 6. Create Product (Admin)
**POST** `/products`

Create a new product.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "productName": "Cotton Casual Kurta",
  "productDescription": "Comfortable cotton kurta perfect for everyday wear",
  "category": "men",
  "subCategory": "ethnic",
  "productType": "kurta",
  "price": 999,
  "currencyType": "INR",
  "offerType": "percentage",
  "offerValue": 20,
  "tax": 18,
  "sizes": ["S", "M", "L", "XL"],
  "colors": [
    {
      "colorName": "White",
      "colorCode": "#FFFFFF",
      "colorImage": "https://example.com/kurta-white.jpg",
      "stock": 50
    },
    {
      "colorName": "Blue",
      "colorCode": "#0000FF",
      "colorImage": "https://example.com/kurta-blue.jpg",
      "stock": 75
    }
  ],
  "images": [
    "https://example.com/kurta1.jpg",
    "https://example.com/kurta2.jpg"
  ],
  "units": 125,
  "tags": ["ethnic", "casual", "cotton"],
  "brand": "Urban Fashion",
  "material": "100% Cotton",
  "careInstructions": "Machine wash cold with like colors",
  "weight": 200,
  "dimensions": {"length": 72, "width": 52, "height": 2},
  "sku": "MEN-KURTA-WHT-M-001",
  "vendor": "Cotton Crafts Ltd",
  "countryOfOrigin": "India",
  "isFeatured": true
}
```

**Required Fields:**
- `productName` (max 200 chars)
- `productDescription` (max 2000 chars)
- `category` (enum: `men`, `women`, `kids`, `unisex`)
- `subCategory`
- `productType`
- `price` (positive number)
- `sizes` (array, min 1 size)
- `colors` (array, min 1 color with colorName, colorCode, stock)
- `images` (array, min 1 image)
- `units` (non-negative integer)

**Optional Fields:**
- `currencyType` (default: `INR`)
- `offerType` (enum: `percentage`, `amount`, `none`, default: `none`)
- `offerValue` (default: 0)
- `tax` (0-100, default: 0)
- `tags` (array)
- `brand`, `material`, `careInstructions`
- `weight`, `dimensions`, `sku`, `vendor`
- `countryOfOrigin` (default: `India`)
- `isFeatured` (default: `false`)

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "prod_new123",
    "productId": "prod_new123",
    "productName": "Cotton Casual Kurta",
    ...
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

---

### 7. Update Product (Admin)
**PUT** `/products/:id`

Update an existing product.

**Auth Required:** Yes (Admin)

**Request Body:** All fields optional (same as Create Product)

**Note:** Cannot update `productId`, `soldCount`, `createdAt`, `rating`

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "prod_abc123",
    "productName": "Updated Product Name",
    ...
  }
}
```

---

### 8. Update Product Stock (Admin)
**PUT** `/products/:id/stock`

Update product inventory (overall units or color-specific stock).

**Auth Required:** Yes (Admin)

**Request Body (Update Overall Units):**
```json
{
  "units": 200
}
```

**Request Body (Update Color-Specific Stock):**
```json
{
  "colorStock": [
    {
      "colorName": "White",
      "stock": 60
    },
    {
      "colorName": "Blue",
      "stock": 80
    }
  ]
}
```

**Note:** When updating `colorStock`, the system automatically recalculates `units` as the sum of all color stocks.

**Response (200):**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": "prod_abc123",
    "units": 140,
    "colors": [
      {"colorName": "White", "colorCode": "#FFFFFF", "stock": 60},
      {"colorName": "Blue", "colorCode": "#0000FF", "stock": 80}
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### 9. Update Sold Count (Admin)
**PUT** `/products/:id/sold`

Increment the sold count when an order is completed.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "quantity": 5
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sold count updated successfully",
  "data": {
    "soldCount": 83
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid quantity"
}
```

---

### 10. Delete Product (Admin)
**DELETE** `/products/:id`

Delete or deactivate a product.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `permanent` (default: `false`) - Set to `true` for permanent deletion

**Soft Delete (Default):**
```
DELETE /products/prod_abc123
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deactivated successfully"
}
```

**Permanent Delete:**
```
DELETE /products/prod_abc123?permanent=true
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product permanently deleted"
}
```

---

## Category Endpoints

### 1. Get All Categories
**GET** `/categories`

Get all categories with subcategories (public access).

**Auth Required:** No

**Query Parameters:**
- `isActive` - Filter by active status (`true`/`false`)

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "cat_men_001",
      "categoryId": "cat_men_001",
      "categoryName": "Men",
      "categorySlug": "men",
      "description": "Men's clothing and accessories",
      "imageUrl": "https://example.com/categories/men-banner.jpg",
      "subCategories": [
        {
          "subCategoryId": "subcat_men_casual_001",
          "subCategoryName": "Casual",
          "subCategorySlug": "casual",
          "description": "Casual wear for everyday comfort",
          "createdAt": "2025-12-31T10:00:00.000Z"
        },
        {
          "subCategoryId": "subcat_men_ethnic_001",
          "subCategoryName": "Ethnic",
          "subCategorySlug": "ethnic",
          "description": "Traditional and ethnic wear",
          "createdAt": "2025-12-31T10:00:00.000Z"
        }
      ],
      "isActive": true,
      "displayOrder": 1,
      "createdAt": "2025-12-31T10:00:00.000Z",
      "updatedAt": "2025-12-31T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Category by ID
**GET** `/categories/:id`

Get a single category with subcategories (public access).

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cat_men_001",
    "categoryId": "cat_men_001",
    "categoryName": "Men",
    "categorySlug": "men",
    "description": "Men's clothing and accessories",
    "imageUrl": "https://example.com/categories/men-banner.jpg",
    "subCategories": [...],
    "isActive": true,
    "displayOrder": 1,
    "createdAt": "2025-12-31T10:00:00.000Z",
    "updatedAt": "2025-12-31T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 3. Get Category by Slug
**GET** `/categories/slug/:slug`

Get category by slug (public access).

**Auth Required:** No

**Example:**
```
GET /categories/slug/men
```

**Response:** Same as Get Category by ID

---

### 4. Get SubCategories for Category
**GET** `/categories/:categoryId/subcategories`

Get all subcategories for a specific category (public access).

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "subCategoryId": "subcat_men_casual_001",
      "subCategoryName": "Casual",
      "subCategorySlug": "casual",
      "description": "Casual wear for everyday comfort",
      "createdAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "subCategoryId": "subcat_men_ethnic_001",
      "subCategoryName": "Ethnic",
      "subCategorySlug": "ethnic",
      "description": "Traditional and ethnic wear",
      "createdAt": "2025-12-31T10:00:00.000Z"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 5. Create Category (Admin)
**POST** `/categories`

Create a new category with optional subcategories.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "categoryName": "Ethnic Wear",
  "categorySlug": "ethnic",
  "description": "Traditional ethnic and cultural clothing",
  "imageUrl": "https://example.com/categories/ethnic-banner.jpg",
  "subCategories": [
    {
      "subCategoryName": "Folk",
      "subCategorySlug": "folk",
      "description": "Traditional folk wear from different regions"
    },
    {
      "subCategoryName": "Punjabi",
      "subCategorySlug": "punjabi",
      "description": "Punjabi suits and traditional attire"
    }
  ],
  "isActive": true,
  "displayOrder": 4
}
```

**Required Fields:**
- `categoryName` (max 100 chars)
- `categorySlug` (unique, lowercase letters, numbers, hyphens only)

**Optional Fields:**
- `description` (max 500 chars)
- `imageUrl` (valid URL)
- `subCategories` (array)
- `isActive` (default: `true`)
- `displayOrder` (default: `1`)

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat_ethnic_001",
    "categoryId": "cat_ethnic_001",
    "categoryName": "Ethnic Wear",
    "categorySlug": "ethnic",
    ...
  }
}
```

**Error Response (400) - Duplicate Slug:**
```json
{
  "success": false,
  "message": "Category slug already exists"
}
```

---

### 6. Update Category (Admin)
**PUT** `/categories/:id`

Update an existing category.

**Auth Required:** Yes (Admin)

**Request Body:** All fields optional (except `categoryId`, `createdAt`, `subCategories`)

**Note:** Cannot update `categoryId`, `createdAt`. Use separate endpoints to manage subcategories.

**Example:**
```json
{
  "categoryName": "Men's Clothing",
  "description": "Updated description for men's category",
  "imageUrl": "https://example.com/new-banner.jpg",
  "isActive": true,
  "displayOrder": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": "cat_men_001",
    "categoryName": "Men's Clothing",
    ...
  }
}
```

**Error Response (400) - Duplicate Slug:**
```json
{
  "success": false,
  "message": "Category slug already exists"
}
```

---

### 7. Delete Category (Admin)
**DELETE** `/categories/:id`

Delete or deactivate a category.

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `permanent` (default: `false`) - Set to `true` for permanent deletion

**Soft Delete (Default):**
```
DELETE /categories/cat_men_001
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category deactivated successfully"
}
```

**Permanent Delete:**
```
DELETE /categories/cat_men_001?permanent=true
```

**Response (200):**
```json
{
  "success": true,
  "message": "Category permanently deleted"
}
```

**Error Response (400) - Category in Use:**
```json
{
  "success": false,
  "message": "Cannot delete category with associated products. Please delete or reassign products first."
}
```

---

## SubCategory Management Endpoints

### 8. Add SubCategory to Category (Admin)
**POST** `/categories/:categoryId/subcategories`

Add a new subcategory to an existing category.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "subCategoryName": "Bhangra",
  "subCategorySlug": "bhangra",
  "description": "Bhangra performance and festive wear"
}
```

**Required Fields:**
- `subCategoryName` (max 100 chars)
- `subCategorySlug` (unique within category, lowercase letters, numbers, hyphens)

**Optional Fields:**
- `description` (max 500 chars)

**Response (201):**
```json
{
  "success": true,
  "message": "Subcategory added successfully",
  "data": {
    "subCategoryId": "subcat_1735659600000",
    "subCategoryName": "Bhangra",
    "subCategorySlug": "bhangra",
    "description": "Bhangra performance and festive wear",
    "createdAt": "2025-12-31T10:00:00.000Z"
  }
}
```

**Error Response (400) - Duplicate Slug:**
```json
{
  "success": false,
  "message": "Subcategory slug already exists in this category"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

### 9. Update SubCategory (Admin)
**PUT** `/categories/:categoryId/subcategories/:subCategoryId`

Update an existing subcategory.

**Auth Required:** Yes (Admin)

**Request Body:** All fields optional (except `subCategoryId`, `createdAt`)

**Example:**
```json
{
  "subCategoryName": "Updated Subcategory Name",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "subCategoryId": "subcat_men_casual_001",
    "subCategoryName": "Updated Subcategory Name",
    "subCategorySlug": "casual",
    "description": "Updated description",
    "createdAt": "2025-12-31T10:00:00.000Z",
    "updatedAt": "2025-12-31T15:00:00.000Z"
  }
}
```

**Error Response (400) - Duplicate Slug:**
```json
{
  "success": false,
  "message": "Subcategory slug already exists in this category"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Subcategory not found"
}
```

---

### 10. Remove SubCategory from Category (Admin)
**DELETE** `/categories/:categoryId/subcategories/:subCategoryId`

Remove a subcategory from a category.

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Subcategory removed successfully"
}
```

**Error Response (400) - SubCategory in Use:**
```json
{
  "success": false,
  "message": "Cannot remove subcategory with associated products. Please delete or reassign products first."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Category not found"
}
```

---

## Order Endpoints

Complete order management system with comprehensive order lifecycle management. See [Order Schema Documentation](ORDER_SCHEMA.md) for detailed field specifications.

### Order Status Flow
- **Normal**: `pending` → `confirmed` → `processing` → `packed` → `shipped` → `out-for-delivery` → `delivered`
- **Cancellation**: `pending/confirmed` → `cancelled`
- **Return**: `delivered` → `returned` → `refunded`

### Payment Status
- `pending` - Payment not yet completed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded
- `partially-refunded` - Partial refund completed

---

### 1. Get User Orders
**GET** `/orders/my-orders`

Get all orders for the authenticated user with optional filters.

**Auth Required:** Yes

**Query Parameters:**
- `limit` (default: 50) - Number of orders to return (integer)
- `orderStatus` - Filter by order status (see enum below)
- `paymentStatus` - Filter by payment status: `pending`, `completed`, `failed`, `refunded`, `partially-refunded`
- `fromDate` - Filter orders from date (ISO 8601 format)
- `toDate` - Filter orders to date (ISO 8601 format)

**Order Status Enum:**
`pending`, `confirmed`, `processing`, `packed`, `shipped`, `out-for-delivery`, `delivered`, `cancelled`, `returned`, `refunded`, `failed`

**Example:**
```
GET /orders/my-orders?limit=20&orderStatus=delivered&fromDate=2025-01-01T00:00:00.000Z&toDate=2025-12-31T23:59:59.000Z
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "order_2025_abc123",
      "orderId": "order_2025_abc123",
      "orderNumber": "ORD-2025-001234",
      "userId": "user_xyz789",
      "userEmail": "john.doe@example.com",
      "userName": "John Doe",
      "userPhone": "+919876543210",
      "orderItems": [
        {
          "productId": "prod_kurta_001",
          "productName": "Cotton Casual Kurta",
          "productImage": "https://example.com/kurta.jpg",
          "category": "men",
          "subCategory": "ethnic",
          "productType": "kurta",
          "size": "M",
          "color": {
            "colorName": "White",
            "colorCode": "#FFFFFF"
          },
          "quantity": 2,
          "pricePerUnit": 999,
          "discount": 199.80,
          "tax": 143.82,
          "totalPrice": 1943.82,
          "sku": "MEN-KURTA-WHT-M-001"
        }
      ],
      "subtotal": 3497,
      "discount": 349.70,
      "tax": 386.66,
      "deliveryCharges": 100,
      "totalAmount": 3633.96,
      "currencyType": "INR",
      "offerApplied": {
        "couponCode": "FIRST10",
        "discountType": "percentage",
        "discountValue": 10,
        "discountAmount": 349.70,
        "description": "First Order - 10% off"
      },
      "shippingAddress": {
        "fullName": "John Doe",
        "phoneNumber": "+919876543210",
        "addressLine1": "123 Marine Drive",
        "addressLine2": "Apartment 5C",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400020",
        "country": "India",
        "landmark": "Near Gateway of India",
        "addressType": "home"
      },
      "billingAddress": {
        "fullName": "John Doe",
        "phoneNumber": "+919876543210",
        "addressLine1": "123 Marine Drive",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400020",
        "country": "India",
        "addressType": "home"
      },
      "orderStatus": "shipped",
      "paymentStatus": "completed",
      "paymentMethod": "upi",
      "paymentId": "pay_abc123xyz",
      "trackingNumber": "TRK987654321",
      "courierService": "BlueDart",
      "estimatedDelivery": "2026-01-05T00:00:00.000Z",
      "customerNotes": "Please call before delivery",
      "internalNotes": "Premium customer - priority delivery",
      "createdAt": "2025-12-31T10:00:00.000Z",
      "updatedAt": "2026-01-02T09:00:00.000Z",
      "confirmedAt": "2025-12-31T10:05:00.000Z",
      "shippedAt": "2026-01-02T09:00:00.000Z",
      "refundStatus": "not-requested"
    }
  ]
}
```

---

### 2. Get All Orders (Admin)
**GET** `/orders`

Get all orders with comprehensive filtering (admin only).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `limit` (default: 50) - Number of orders to return
- `orderStatus` - Filter by order status
- `paymentStatus` - Filter by payment status
- `paymentMethod` - Filter by payment method: `cod`, `card`, `upi`, `netbanking`, `wallet`, `emi`
- `userId` - Filter by specific user ID
- `fromDate` - Filter orders from date (ISO 8601 format)
- `toDate` - Filter orders to date (ISO 8601 format)

**Example:**
```
GET /orders?limit=100&orderStatus=pending&paymentMethod=cod&fromDate=2025-12-01T00:00:00.000Z
```

**Response (200):** Same structure as Get User Orders

---

### 3. Get Order by ID
**GET** `/orders/:orderId`

Get a single order by ID. Users can only view their own orders, admins can view any order.

**Auth Required:** Yes

**URL Parameters:**
- `orderId` - Order ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order_2025_abc123",
    "orderId": "order_2025_abc123",
    "orderNumber": "ORD-2025-001234",
    ...
  }
}
```

**Error Response (403) - Not Authorized:**
```json
{
  "success": false,
  "message": "You are not authorized to view this order"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### 4. Create Order
**POST** `/orders`

Create a new order with stock validation and automatic stock reduction.

**Auth Required:** Yes

**Request Body:**
```json
{
  "orderItems": [
    {
      "productId": "prod_kurta_001",
      "productName": "Cotton Casual Kurta",
      "productImage": "https://example.com/kurta.jpg",
      "category": "men",
      "subCategory": "ethnic",
      "productType": "kurta",
      "size": "M",
      "color": {
        "colorName": "White",
        "colorCode": "#FFFFFF"
      },
      "quantity": 2,
      "pricePerUnit": 999,
      "discount": 199.80,
      "tax": 143.82,
      "totalPrice": 1943.82,
      "sku": "MEN-KURTA-WHT-M-001"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "123 Marine Drive",
    "addressLine2": "Apartment 5C",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400020",
    "country": "India",
    "landmark": "Near Gateway of India",
    "addressType": "home"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "phoneNumber": "+919876543210",
    "addressLine1": "456 Park Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400021",
    "country": "India",
    "addressType": "work"
  },
  "subtotal": 3497,
  "discount": 349.70,
  "tax": 386.66,
  "deliveryCharges": 100,
  "totalAmount": 3633.96,
  "currencyType": "INR",
  "paymentMethod": "upi",
  "offerApplied": {
    "couponCode": "FIRST10",
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 349.70,
    "description": "First Order - 10% off"
  },
  "customerNotes": "Please call before delivery"
}
```

**Required Fields:**
- `orderItems` (array, min 1 item)
  - `productId` - Product ID
  - `productName` - Product name (snapshot)
  - `productImage` - Product image URL
  - `category` - Category
  - `subCategory` - Subcategory
  - `productType` - Product type
  - `size` - Selected size
  - `color` - Color object with `colorName` and `colorCode` (hex format `#FFFFFF`)
  - `quantity` - Quantity (min 1)
  - `pricePerUnit` - Price per unit at time of order
  - `discount` - Discount per item (default: 0)
  - `tax` - Tax per item (default: 0)
  - `totalPrice` - Total price for this item
- `shippingAddress` - Complete address object
  - `fullName`
  - `phoneNumber` - Valid phone format (`+1234567890`)
  - `addressLine1`
  - `city`
  - `state`
  - `postalCode`
  - `country`
- `subtotal` - Sum of all items before discounts
- `tax` - Total tax amount
- `deliveryCharges` - Shipping charges
- `totalAmount` - Final amount (subtotal - discount + tax + delivery)
- `paymentMethod` - Payment method: `cod`, `card`, `upi`, `netbanking`, `wallet`, `emi`

**Optional Fields:**
- `billingAddress` - Billing address (if different from shipping)
- `discount` - Total discount amount (default: 0)
- `currencyType` - Currency: `INR`, `USD`, `EUR`, `GBP` (default: `INR`)
- `offerApplied` - Coupon/offer details
  - `couponCode`
  - `discountType`: `percentage`, `amount`, `free-shipping`
  - `discountValue`
  - `discountAmount`
  - `description`
- `customerNotes` - Customer's special instructions (max 500 chars)
- `sku` - Product SKU (in orderItems)
- `addressLine2`, `landmark`, `addressType` (in address objects)

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order_2025_new123",
    "orderId": "order_2025_new123",
    "orderNumber": "ORD-2025-001235",
    "userId": "user_xyz789",
    "orderStatus": "pending",
    "paymentStatus": "pending",
    "refundStatus": "not-requested",
    ...
  }
}
```

**Error Response (400) - Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for product Cotton Casual Kurta. Available: 50, Requested: 100"
}
```

**Error Response (400) - Product Not Active:**
```json
{
  "success": false,
  "message": "Product Cotton Casual Kurta is not available for purchase"
}
```

**Error Response (400) - Color Not Available:**
```json
{
  "success": false,
  "message": "Color White is not available for product Cotton Casual Kurta"
}
```

**Notes:**
- Stock is automatically reduced when order is created
- Order status defaults to `pending`
- Payment status defaults to `pending` (or `completed` for COD after admin confirmation)
- Auto-generated `orderNumber` format: `ORD-YYYY-NNNNNN`
- Refund status defaults to `not-requested`

---

### 5. Update Order Status (Admin)
**PUT** `/orders/:orderId/status`

Update order status with automatic timestamp tracking.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "orderStatus": "shipped",
  "internalNotes": "Order shipped via BlueDart"
}
```

**Required Fields:**
- `orderStatus` - New order status (enum)

**Optional Fields:**
- `internalNotes` - Admin notes (max 500 chars)

**Valid Order Status Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed (sets `confirmedAt` timestamp)
- `processing` - Order being prepared
- `packed` - Order packed
- `shipped` - Order shipped (sets `shippedAt` timestamp)
- `out-for-delivery` - Out for delivery
- `delivered` - Delivered (sets `deliveredAt` timestamp)
- `cancelled` - Cancelled (sets `cancelledAt` timestamp)
- `returned` - Returned by customer
- `refunded` - Payment refunded
- `failed` - Order processing failed

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "order_2025_abc123",
    "orderStatus": "shipped",
    "shippedAt": "2026-01-02T09:00:00.000Z",
    "updatedAt": "2026-01-02T09:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Notes:**
- Automatically sets status-specific timestamps:
  - `confirmed` → `confirmedAt`
  - `shipped` → `shippedAt`
  - `delivered` → `deliveredAt`
  - `cancelled` → `cancelledAt`

---

### 6. Update Payment Status (Admin)
**PUT** `/orders/:orderId/payment`

Update payment status with optional payment transaction ID.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "paymentStatus": "completed",
  "paymentId": "pay_abc123xyz",
  "internalNotes": "Payment verified via UPI"
}
```

**Required Fields:**
- `paymentStatus` - Payment status: `pending`, `completed`, `failed`, `refunded`, `partially-refunded`

**Optional Fields:**
- `paymentId` - Payment transaction ID
- `internalNotes` - Admin notes (max 500 chars)

**Response (200):**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "id": "order_2025_abc123",
    "paymentStatus": "completed",
    "paymentId": "pay_abc123xyz",
    "orderStatus": "confirmed",
    "confirmedAt": "2025-12-31T10:05:00.000Z"
  }
}
```

**Notes:**
- If payment status is updated to `completed` and order status is `pending`, the order is automatically confirmed

---

### 7. Add Tracking Information (Admin)
**PUT** `/orders/:orderId/tracking`

Add shipping tracking information to an order.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "trackingNumber": "TRK987654321",
  "courierService": "BlueDart",
  "estimatedDelivery": "2026-01-05T00:00:00.000Z"
}
```

**Required Fields:**
- `trackingNumber` - Courier tracking number
- `courierService` - Courier service name

**Optional Fields:**
- `estimatedDelivery` - Estimated delivery date (ISO 8601 format)

**Response (200):**
```json
{
  "success": true,
  "message": "Tracking information added successfully",
  "data": {
    "id": "order_2025_abc123",
    "trackingNumber": "TRK987654321",
    "courierService": "BlueDart",
    "estimatedDelivery": "2026-01-05T00:00:00.000Z"
  }
}
```

---

### 8. Cancel Order
**POST** `/orders/:orderId/cancel`

Cancel an order. Users can cancel their own orders (before shipping), admins can cancel any order.

**Auth Required:** Yes

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "cancellationReason": "Changed my mind"
}
```

**Required Fields:**
- `cancellationReason` - Reason for cancellation (max 500 chars)

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order_2025_abc123",
    "orderStatus": "cancelled",
    "cancellationReason": "Changed my mind",
    "cancelledAt": "2025-12-31T11:00:00.000Z"
  }
}
```

**Error Response (400) - Cannot Cancel:**
```json
{
  "success": false,
  "message": "Cannot cancel order that has already been shipped or delivered"
}
```

**Error Response (403) - Not Authorized:**
```json
{
  "success": false,
  "message": "You are not authorized to cancel this order"
}
```

**Notes:**
- Stock is automatically restored when order is cancelled
- Sets `orderStatus` to `cancelled`
- Sets `cancelledAt` timestamp
- Users can only cancel orders in `pending`, `confirmed`, or `processing` status
- Admins can cancel orders in any status except `delivered`

---

### 9. Return Order
**POST** `/orders/:orderId/return`

Initiate a return for a delivered order.

**Auth Required:** Yes

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "returnReason": "Product size does not fit",
  "refundAmount": 3633.96
}
```

**Required Fields:**
- `returnReason` - Reason for return (max 500 chars)

**Optional Fields:**
- `refundAmount` - Amount to refund (defaults to total order amount)

**Response (200):**
```json
{
  "success": true,
  "message": "Return request submitted successfully",
  "data": {
    "id": "order_2025_abc123",
    "orderStatus": "returned",
    "returnReason": "Product size does not fit",
    "refundAmount": 3633.96,
    "refundStatus": "requested",
    "returnedAt": "2026-01-10T10:00:00.000Z"
  }
}
```

**Error Response (400) - Cannot Return:**
```json
{
  "success": false,
  "message": "Only delivered orders can be returned"
}
```

**Error Response (403) - Not Authorized:**
```json
{
  "success": false,
  "message": "You are not authorized to return this order"
}
```

**Notes:**
- Only `delivered` orders can be returned
- Sets `orderStatus` to `returned`
- Sets `refundStatus` to `requested`
- Sets `returnedAt` timestamp
- Stock is automatically restored

---

### 10. Process Refund (Admin)
**PUT** `/orders/:orderId/refund`

Process a refund for a returned or cancelled order.

**Auth Required:** Yes (Admin)

**URL Parameters:**
- `orderId` - Order ID

**Request Body:**
```json
{
  "refundAmount": 3633.96,
  "refundStatus": "completed",
  "internalNotes": "Refund processed via original payment method"
}
```

**Required Fields:**
- `refundAmount` - Amount to refund (positive number)
- `refundStatus` - Refund status: `pending`, `completed`, `rejected`

**Optional Fields:**
- `internalNotes` - Admin notes (max 500 chars)

**Response (200):**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "id": "order_2025_abc123",
    "refundAmount": 3633.96,
    "refundStatus": "completed",
    "paymentStatus": "refunded",
    "refundedAt": "2026-01-12T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Notes:**
- If `refundStatus` is set to `completed`:
  - Sets `paymentStatus` to `refunded`
  - Sets `refundedAt` timestamp
- Partial refunds can be processed by specifying a lower `refundAmount`

---

## Error Responses

### Common Error Formats

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## Notes

1. **Firebase Authentication**: Use Firebase Client SDK for initial authentication. The backend verifies tokens and manages user data.

2. **Timestamps**: All timestamps are in ISO 8601 format (UTC).

3. **Product Stock**: Stock is automatically updated when orders are created or cancelled.

4. **Account Status**: Users with `blocked` or `suspended` status cannot log in.

5. **Wishlist**: Stores product IDs only. Use the GET wishlist endpoint to retrieve full product details.

6. **Address**: Can be stored as a string or object. Object format is recommended for structured data.

7. **Role Management**: Only admins can modify user roles and account statuses.
