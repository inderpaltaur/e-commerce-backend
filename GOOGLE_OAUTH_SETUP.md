# Google OAuth Implementation Guide

## Overview
This e-commerce backend has Google OAuth fully implemented using Firebase Authentication and Cloud Firestore.

## Configuration Status ✅

### Backend Configuration
- **Firebase Admin SDK**: Configured in `src/config/firebase.js`
- **Service Account**: `serviceAccountKey.json` (present)
- **Environment Variables**: `.env` (configured)
- **Cloud Firestore**: Active and ready
- **Project ID**: `e-commerce-7a1bd`

### Frontend Configuration
- **Firebase Client SDK**: Configured in `firebase-web.js`
- **Google Auth Provider**: Ready
- **Auth Domain**: `e-commerce-7a1bd.firebaseapp.com`

## API Endpoints

### 1. Social Authentication (Google Login)
**Endpoint**: `POST /api/auth/social-auth`

**Request Body**:
```json
{
  "uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "authProvider": "Google",
  "photoURL": "https://example.com/photo.jpg",
  "phoneNumber": "+1234567890"
}
```

**Response (New User)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "firebase-user-uid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "authProvider": "Google",
    "photoURL": "https://example.com/photo.jpg",
    "isEmailVerified": true,
    "accountStatus": "active",
    "createdAt": "2024-01-02T10:00:00.000Z",
    "updatedAt": "2024-01-02T10:00:00.000Z"
  }
}
```

**Response (Existing User)**:
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "uid": "firebase-user-uid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "lastLogin": "2024-01-02T10:00:00.000Z"
  }
}
```

### 2. Verify Token
**Endpoint**: `POST /api/auth/verify`
**Headers**: `Authorization: Bearer <firebase-id-token>`

### 3. Link Provider
**Endpoint**: `POST /api/auth/link-provider`
**Headers**: `Authorization: Bearer <firebase-id-token>`

### 4. Get Linked Providers
**Endpoint**: `GET /api/auth/linked-providers`
**Headers**: `Authorization: Bearer <firebase-id-token>`

## Frontend Implementation Example

### Using Popup Method (Recommended)
```javascript
import { auth, googleProvider, signInWithPopup } from './firebase-web.js';

async function signInWithGoogle() {
  try {
    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);

    // Get user info
    const user = result.user;
    const idToken = await user.getIdToken();

    // Send to backend
    const response = await fetch('http://localhost:5000/api/auth/social-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        authProvider: 'Google'
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store the ID token for future requests
      localStorage.setItem('authToken', idToken);
      console.log('Login successful:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}
```

### Using Redirect Method
```javascript
import { auth, googleProvider, signInWithRedirect } from './firebase-web.js';
import { getRedirectResult } from 'firebase/auth';

// Initiate sign-in
async function initiateGoogleSignIn() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Redirect error:', error);
  }
}

// Handle redirect result (call this on page load)
async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);

    if (result) {
      const user = result.user;
      const idToken = await user.getIdToken();

      // Send to backend (same as popup method)
      const response = await fetch('http://localhost:5000/api/auth/social-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          authProvider: 'Google'
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', idToken);
        return data.data;
      }
    }
  } catch (error) {
    console.error('Redirect result error:', error);
  }
}
```

## Making Authenticated Requests

After login, include the Firebase ID token in the Authorization header:

```javascript
async function getUserProfile() {
  const token = localStorage.getItem('authToken');

  const response = await fetch('http://localhost:5000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}
```

## Firebase Console Setup

### Enable Google Sign-In
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `e-commerce-7a1bd`
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Enable the toggle
6. Add your support email
7. Click **Save**

### Authorized Domains
Make sure these domains are authorized:
- `localhost` (for development)
- `e-commerce-7a1bd.firebaseapp.com`
- Your production domain

## Testing the Setup

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

The server should start on `http://localhost:5000`

### 2. Test Endpoint
```bash
curl http://localhost:5000/api/auth
```

### 3. Test Google OAuth Flow
Create an HTML test file with the frontend code above, or integrate into your existing frontend.

## Security Features

1. **Token Verification**: All protected routes verify Firebase ID tokens
2. **Account Status Check**: Automatically checks if account is active
3. **Provider Linking**: Users can link multiple auth providers
4. **Token Revocation**: Logout from all devices functionality
5. **Cloud Firestore Rules**: Set up security rules in Firebase Console

## Firestore Security Rules (Recommended)

Add these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Products collection (public read, admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
    }

    // Categories collection (public read, admin write)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Troubleshooting

### Error: "Firebase service account file not found"
- Ensure `serviceAccountKey.json` exists in the backend folder
- Check `.env` file has correct `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json`

### Error: "Invalid token"
- Token might be expired (Firebase ID tokens expire after 1 hour)
- Refresh the token using Firebase Client SDK's `getIdToken(true)`

### Error: "Google sign-in popup blocked"
- Browser is blocking popups
- Use redirect method instead or ask user to allow popups

### Error: "Account is suspended/inactive"
- Check user's `accountStatus` field in Firestore
- Update to 'active' or contact support

## Environment Variables

Your `.env` file should contain:

```env
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=e-commerce-7a1bd
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@e-commerce-7a1bd.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://e-commerce-7a1bd.firebaseio.com
JWT_SECRET=ecommerce-jwt-secret-key-change-in-production-2024
JWT_EXPIRE=7d
```

## Next Steps

1. ✅ Firebase Admin SDK configured
2. ✅ Firebase Client SDK configured
3. ✅ Google OAuth provider ready
4. ✅ Cloud Firestore active
5. ✅ Backend endpoints ready
6. 🔲 Enable Google Sign-In in Firebase Console
7. 🔲 Integrate frontend with `firebase-web.js`
8. 🔲 Set up Firestore security rules
9. 🔲 Test the complete flow

## Support

For issues or questions:
- Check Firebase Console logs
- Review backend server logs (`npm run dev`)
- Verify all environment variables are set correctly
