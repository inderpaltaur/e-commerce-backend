# OAuth Setup Guide - Firebase Authentication

Complete guide for setting up OAuth authentication with Firebase for the E-Commerce backend.

## Table of Contents

1. [Firebase Console Setup](#firebase-console-setup)
2. [Supported Providers](#supported-providers)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Client-Side Implementation](#client-side-implementation)
5. [Provider Linking](#provider-linking)
6. [Security Best Practices](#security-best-practices)

---

## Firebase Console Setup

### 1. Enable Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the providers you want to use

### 2. Google OAuth Setup

1. Click on **Google** in the sign-in providers list
2. Toggle **Enable**
3. Select a **Project support email**
4. Click **Save**

**For Web Applications:**
```javascript
// No additional configuration needed
// Firebase handles the OAuth flow automatically
```

**For Custom Domains:**
1. Add your domain to **Authorized domains**
2. Add OAuth redirect URIs in Google Cloud Console

### 3. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add **Facebook Login** product
4. Get **App ID** and **App Secret**
5. In Firebase Console:
   - Click on **Facebook**
   - Toggle **Enable**
   - Enter **App ID** and **App Secret**
   - Copy the **OAuth redirect URI**
6. Back in Facebook Developers:
   - Go to **Facebook Login** → **Settings**
   - Add the Firebase OAuth redirect URI to **Valid OAuth Redirect URIs**
   - Save changes

### 4. Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get **API Key** and **API Secret Key**
4. In Firebase Console:
   - Click on **Twitter**
   - Toggle **Enable**
   - Enter **API Key** and **API Secret Key**
   - Copy the **Callback URL**
5. Back in Twitter Developer Portal:
   - Add the callback URL to your app settings

### 5. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Get **Client ID** and **Client Secret**
4. In Firebase Console:
   - Click on **GitHub**
   - Toggle **Enable**
   - Enter **Client ID** and **Client Secret**
   - Copy the **Authorization callback URL**
5. Back in GitHub:
   - Add the callback URL

---

## Supported Providers

The backend supports the following OAuth providers:

| Provider | Status | Notes |
|----------|--------|-------|
| Google | ✅ Ready | Easiest to setup |
| Facebook | ✅ Ready | Requires app review for production |
| Twitter | ✅ Ready | Email permission needed |
| GitHub | ✅ Ready | Great for developer tools |
| Microsoft | ✅ Ready | Good for enterprise |
| Apple | ✅ Ready | Required for iOS apps |

---

## Backend API Endpoints

### 1. Social Authentication (Login/Register)

**POST** `/api/auth/social-auth`

Handles both new user registration and existing user login via OAuth.

**Request Body:**
```json
{
  "uid": "firebase-oauth-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "authProvider": "Google",
  "photoURL": "https://example.com/photo.jpg",
  "phoneNumber": "+1234567890"
}
```

**Response (200/201):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "uid": "firebase-oauth-uid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "accountStatus": "active",
    ...
  }
}
```

### 2. Generate Custom Token

**POST** `/api/auth/custom-token`

Generates a custom Firebase token for server-side authentication.

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

### 3. Refresh Token

**POST** `/api/auth/refresh`

Validates token and returns fresh user data.

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
    ...
  }
}
```

### 4. Link OAuth Provider

**POST** `/api/auth/link-provider` (Authenticated)

Links an additional OAuth provider to existing account.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

**Request Body:**
```json
{
  "uid": "user-firebase-uid",
  "provider": "Facebook",
  "providerUid": "facebook-user-id",
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
        "providerUid": "facebook-user-id",
        "email": "user@facebook.com",
        "linkedAt": "2025-12-31T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Unlink OAuth Provider

**POST** `/api/auth/unlink-provider` (Authenticated)

Removes an OAuth provider from the account.

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

### 6. Get Linked Providers

**GET** `/api/auth/linked-providers` (Authenticated)

Gets all OAuth providers linked to the account.

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

### 7. Revoke All Tokens

**POST** `/api/auth/revoke-tokens` (Authenticated)

Logs out user from all devices by revoking all refresh tokens.

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

## Client-Side Implementation

See [CLIENT_OAUTH_EXAMPLES.md](CLIENT_OAUTH_EXAMPLES.md) for complete client-side code examples.

### Quick Start

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Sign-In
const provider = new GoogleAuthProvider();

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    // Send to backend
    const response = await fetch('/api/auth/social-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Google',
        photoURL: user.photoURL
      })
    });

    const data = await response.json();
    console.log('User authenticated:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Provider Linking

### Use Cases

1. **Account Consolidation**: Allow users to sign in with multiple providers
2. **Backup Authentication**: Provide alternative sign-in methods
3. **Cross-Platform**: Link mobile and web accounts

### Flow

1. User signs in with primary provider (e.g., Google)
2. User wants to link Facebook account
3. User authenticates with Facebook on client-side
4. Client sends link request to backend
5. Backend adds Facebook to `linkedProviders` array
6. User can now sign in with either Google or Facebook

### Important Notes

- Users cannot unlink their only authentication method
- Each provider can only be linked once per account
- Linking requires active authentication session

---

## Security Best Practices

### 1. Token Validation

Always validate Firebase ID tokens on the backend:

```javascript
const decodedToken = await auth.verifyIdToken(token, true);
// checkRevoked = true ensures token hasn't been revoked
```

### 2. Account Status Checks

Check account status before allowing authentication:

```javascript
if (userData.accountStatus !== 'active') {
  // Reject login
}
```

### 3. HTTPS Only

- Always use HTTPS in production
- Configure Firebase to only accept HTTPS redirects

### 4. Scope Minimization

Only request OAuth scopes you actually need:

```javascript
provider.addScope('profile');
provider.addScope('email');
// Don't request unnecessary scopes
```

### 5. Token Refresh

Implement token refresh to maintain security:

```javascript
// Refresh token every 50 minutes (tokens expire after 60 minutes)
setInterval(async () => {
  const token = await auth.currentUser.getIdToken(true);
  // Update stored token
}, 50 * 60 * 1000);
```

### 6. Revoke Tokens on Security Events

Revoke all tokens when:
- User changes password
- Suspicious activity detected
- User requests logout from all devices

```javascript
await fetch('/api/auth/revoke-tokens', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Troubleshooting

### Common Issues

1. **"Invalid OAuth redirect URI"**
   - Add your domain to Firebase Authorized domains
   - Check OAuth redirect URIs in provider console

2. **"Email already exists"**
   - User registered with different provider
   - Use provider linking instead

3. **"Token expired"**
   - Implement token refresh
   - Check system clock sync

4. **"Account not found"**
   - User exists in Firebase Auth but not in Firestore
   - Check social-auth endpoint implementation

---

## Next Steps

1. ✅ Set up OAuth providers in Firebase Console
2. ✅ Configure backend endpoints
3. 📱 Implement client-side authentication
4. 🔗 Add provider linking UI
5. 🧪 Test all authentication flows
6. 🚀 Deploy to production

For client-side code examples, see [CLIENT_OAUTH_EXAMPLES.md](CLIENT_OAUTH_EXAMPLES.md)
