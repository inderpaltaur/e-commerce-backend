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

Get all products (public access).

**Auth Required:** No

**Query Parameters:**
- `limit` (default: 50)
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter

**Example:**
```
GET /products?category=cat-id-123&minPrice=20&maxPrice=100&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": "product-id-1",
      "name": "Cotton T-Shirt",
      "description": "Comfortable cotton t-shirt",
      "price": 29.99,
      "categoryId": "cat-id-123",
      "stock": 100,
      "imageUrl": "https://example.com/tshirt.jpg",
      "createdAt": "2025-01-01T08:00:00.000Z",
      "updatedAt": "2025-01-01T08:00:00.000Z"
    },
    ...
  ]
}
```

---

### 2. Get Product by ID
**GET** `/products/:id`

Get a single product by ID (public access).

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product-id-1",
    "name": "Cotton T-Shirt",
    "description": "Comfortable cotton t-shirt",
    "price": 29.99,
    "categoryId": "cat-id-123",
    "stock": 100,
    "imageUrl": "https://example.com/tshirt.jpg",
    ...
  }
}
```

---

### 3. Get Products by Category
**GET** `/products/category/:categoryId`

Get all products in a specific category (public access).

**Auth Required:** No

**Query Parameters:**
- `limit` (default: 50)

**Response:** Same as Get All Products

---

### 4. Create Product (Admin)
**POST** `/products`

Create a new product.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Cotton T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 29.99,
  "categoryId": "cat-id-123",
  "stock": 100,
  "imageUrl": "https://example.com/tshirt.jpg"
}
```

**Required Fields:**
- `name`
- `description`
- `price` (numeric)
- `categoryId`
- `stock` (numeric)

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "product-id-new",
    ...
  }
}
```

---

### 5. Update Product (Admin)
**PUT** `/products/:id`

Update an existing product.

**Auth Required:** Yes (Admin)

**Request Body:** Same as Create Product (all fields optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "product-id-1",
    ...
  }
}
```

---

### 6. Delete Product (Admin)
**DELETE** `/products/:id`

Delete a product.

**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Category Endpoints

### 1. Get All Categories
**GET** `/categories`

Get all categories (public access).

**Auth Required:** No

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "cat-id-1",
      "name": "Men's Clothing",
      "description": "Clothing for men",
      "createdAt": "2025-01-01T08:00:00.000Z",
      "updatedAt": "2025-01-01T08:00:00.000Z"
    },
    ...
  ]
}
```

---

### 2. Get Category by ID
**GET** `/categories/:id`

Get a single category (public access).

**Auth Required:** No

---

### 3. Create Category (Admin)
**POST** `/categories`

Create a new category.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Women's Clothing",
  "description": "Clothing for women"
}
```

**Required Fields:**
- `name`

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "cat-id-new",
    "name": "Women's Clothing",
    "description": "Clothing for women",
    ...
  }
}
```

---

### 4. Update Category (Admin)
**PUT** `/categories/:id`

Update an existing category.

**Auth Required:** Yes (Admin)

---

### 5. Delete Category (Admin)
**DELETE** `/categories/:id`

Delete a category (only if no products use it).

**Auth Required:** Yes (Admin)

**Error Response (400) - Category in Use:**
```json
{
  "success": false,
  "message": "Cannot delete category with associated products"
}
```

---

## Order Endpoints

### 1. Get User Orders
**GET** `/orders/my-orders`

Get all orders for the authenticated user.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "order-id-1",
      "userId": "user-id",
      "items": [
        {
          "productId": "product-id-1",
          "name": "Cotton T-Shirt",
          "price": 29.99,
          "quantity": 2,
          "total": 59.98
        }
      ],
      "totalAmount": 59.98,
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        ...
      },
      "paymentMethod": "cash_on_delivery",
      "status": "pending",
      "createdAt": "2025-12-31T10:00:00.000Z",
      "updatedAt": "2025-12-31T10:00:00.000Z"
    },
    ...
  ]
}
```

---

### 2. Get All Orders (Admin)
**GET** `/orders`

Get all orders (admin only).

**Auth Required:** Yes (Admin)

**Query Parameters:**
- `limit` (default: 50)
- `status` - Filter by status: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

---

### 3. Get Order by ID
**GET** `/orders/:id`

Get a single order (user must own it or be admin).

**Auth Required:** Yes

---

### 4. Create Order
**POST** `/orders`

Create a new order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-id-1",
      "quantity": 2
    },
    {
      "productId": "product-id-2",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "cash_on_delivery"
}
```

**Required Fields:**
- `items` (array, min 1 item)
  - `productId`
  - `quantity` (min 1)
- `shippingAddress`

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-id-new",
    "userId": "user-id",
    "items": [...],
    "totalAmount": 129.97,
    "status": "pending",
    ...
  }
}
```

**Error Response (400) - Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for product Cotton T-Shirt"
}
```

---

### 5. Update Order Status (Admin)
**PUT** `/orders/:id/status`

Update order status.

**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Values:**
- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "order-id-1",
    "status": "processing",
    ...
  }
}
```

---

### 6. Cancel Order
**PUT** `/orders/:id/cancel`

Cancel an order (user must own it, only pending orders can be cancelled).

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

**Error Response (400) - Cannot Cancel:**
```json
{
  "success": false,
  "message": "Only pending orders can be cancelled"
}
```

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
