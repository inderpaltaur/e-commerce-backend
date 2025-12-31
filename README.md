# E-Commerce Backend API

REST API for E-Commerce application built with Express.js and Firebase.

## Features

- User authentication and authorization
- Product management
- Category management
- Order processing
- User profile management
- Admin role-based access control

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
│   │   └── firebase.js          # Firebase configuration
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification & admin check
│   │   └── validation.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   ├── product.routes.js
│   │   └── user.routes.js
│   └── server.js                # Express app entry point
├── .env.example
├── .gitignore
└── package.json
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
4. Enable Authentication (Email/Password)
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

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
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

### Users
- `GET /api/users/profile` - Get user profile (Auth)
- `PUT /api/users/profile` - Update user profile (Auth)
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:uid/set-admin` - Set admin role (Admin)

## Authentication

Protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Firestore Collections

The API uses the following Firestore collections:

- `users` - User profiles
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Customer orders

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
