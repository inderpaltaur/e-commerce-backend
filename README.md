# E-Commerce Backend API

REST API for E-Commerce Clothing Store built with Express.js and Firebase.

## Features

- User authentication (Email/Password and Social Auth)
- User profile management with wishlist
- Product management with filtering
- Category management
- Order processing with stock management
- Admin role-based access control
- Account status management (active, blocked, suspended)
- Email and phone verification

## Tech Stack

- Node.js
- Express.js
- Firebase Admin SDK (Firestore, Authentication, Storage)
- Express Validator
- JWT for authentication
- Helmet for security
- CORS enabled

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js              # Firebase configuration
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── category.controller.js   # Category CRUD
│   │   ├── order.controller.js      # Order management
│   │   ├── product.controller.js    # Product CRUD
│   │   └── user.controller.js       # User profile & wishlist
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification & admin check
│   │   └── validation.middleware.js # Request validation
│   ├── routes/
│   │   ├── auth.routes.js           # Auth endpoints
│   │   ├── category.routes.js       # Category endpoints
│   │   ├── order.routes.js          # Order endpoints
│   │   ├── product.routes.js        # Product endpoints
│   │   └── user.routes.js           # User & wishlist endpoints
│   └── server.js                    # Express app entry point
├── docs/
│   └── API_DOCUMENTATION.md         # Complete API documentation
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Authentication:
   - Email/Password
   - Google (optional)
   - Facebook (optional)
5. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the backend root directory

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the values in `.env`:

```env
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### 4. Run the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/social-auth` - Social authentication (Google, Facebook)
- `POST /api/auth/verify` - Verify token

### Users
- `GET /api/users/profile` - Get user profile (Auth)
- `PUT /api/users/profile` - Update user profile (Auth)
- `GET /api/users/wishlist` - Get wishlist with product details (Auth)
- `POST /api/users/wishlist` - Add to wishlist (Auth)
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist (Auth)
- `POST /api/users/verify-phone` - Verify phone number (Auth)
- `POST /api/users/verify-email` - Verify email (Auth)
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:uid/set-admin` - Set admin role (Admin)
- `PUT /api/users/:uid/account-status` - Update account status (Admin)

### Products
- `GET /api/products` - Get all products (Public)
- `GET /api/products/:id` - Get single product (Public)
- `GET /api/products/category/:categoryId` - Get products by category (Public)
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories (Public)
- `GET /api/categories/:id` - Get single category (Public)
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders/my-orders` - Get user's orders (Auth)
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order (Auth)
- `POST /api/orders` - Create order (Auth)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order (Auth)

## Authentication

Protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Firestore Collections

### Users Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | String | Yes | Firebase Auth UID |
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Email address |
| `phoneNumber` | String | No | Phone number |
| `photoURL` | String | No | Profile photo URL |
| `role` | String | Yes | `customer` or `admin` |
| `authProvider` | String | Yes | `Email`, `Google`, `Facebook`, etc. |
| `isPhoneVerified` | Boolean | Yes | Phone verification status |
| `isEmailVerified` | Boolean | Yes | Email verification status |
| `accountStatus` | String | Yes | `active`, `blocked`, or `suspended` |
| `lastLogin` | String (ISO) | Yes | Last login timestamp |
| `address` | Object/String | No | Shipping address |
| `wishlist` | Array | Yes | Array of product IDs |
| `createdAt` | String (ISO) | Yes | Account creation timestamp |
| `updatedAt` | String (ISO) | Yes | Last update timestamp |

### Other Collections

- **products** - Product catalog with name, price, stock, category, etc.
- **categories** - Product categories
- **orders** - Customer orders with items, status, shipping address

## Security

- Helmet.js for security headers
- CORS enabled
- Input validation with express-validator
- Firebase Authentication for user management
- Role-based access control (Admin/Customer)

## Development

To add new features:

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add middleware if needed in `src/middleware/`
4. Import and use routes in `src/server.js`

## License

ISC
