# OAuth Features Summary

Complete Firebase OAuth authentication functionality for the E-Commerce backend.

## ✅ Features Implemented

### 1. Social Authentication
- **Google OAuth** - Sign in with Google account
- **Facebook OAuth** - Sign in with Facebook account
- **GitHub, Twitter, Microsoft, Apple** - Ready to enable

### 2. Token Management
- **Custom Token Generation** - Server-side authentication flows
- **Token Refresh** - Keep sessions alive with fresh user data
- **Token Revocation** - Logout from all devices

### 3. Provider Linking
- **Link Multiple Providers** - Users can link Google, Facebook, etc. to one account
- **Unlink Providers** - Remove linked providers (with safeguards)
- **View Linked Providers** - See all connected auth methods

### 4. Security Features
- **Account Status Checks** - Prevent blocked/suspended users from logging in
- **Token Validation** - Verify tokens with revocation check
- **Last Login Tracking** - Track user activity
- **Provider Validation** - Prevent duplicate provider links

---

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Email/password registration |
| `/api/auth/login` | POST | No | Email/password login |
| `/api/auth/social-auth` | POST | No | OAuth login/register |
| `/api/auth/verify` | POST | No | Verify Firebase token |
| `/api/auth/custom-token` | POST | No | Generate custom token |
| `/api/auth/refresh` | POST | Yes | Refresh token & user data |
| `/api/auth/link-provider` | POST | Yes | Link OAuth provider |
| `/api/auth/unlink-provider` | POST | Yes | Unlink OAuth provider |
| `/api/auth/linked-providers` | GET | Yes | Get linked providers |
| `/api/auth/revoke-tokens` | POST | Yes | Logout from all devices |

---

## Updated Files

### Backend Controllers
- ✅ `src/controllers/auth.controller.js` - Added 6 new OAuth methods

### Backend Routes
- ✅ `src/routes/auth.routes.js` - Added 6 new OAuth endpoints

### User Schema
- ✅ Added `linkedProviders` field to store connected OAuth accounts

### Documentation
- ✅ `docs/OAUTH_SETUP.md` - Complete Firebase OAuth setup guide
- ✅ `docs/CLIENT_OAUTH_EXAMPLES.md` - Client-side code examples
- ✅ `docs/API_DOCUMENTATION.md` - Updated with OAuth endpoints
- ✅ `docs/USER_SCHEMA.md` - Updated with linkedProviders field

---

## User Schema - linkedProviders Field

```json
{
  "linkedProviders": [
    {
      "provider": "Google",
      "providerUid": "google-user-id-123",
      "email": "user@gmail.com",
      "linkedAt": "2025-12-31T10:00:00.000Z"
    },
    {
      "provider": "Facebook",
      "providerUid": "fb-user-id-456",
      "email": "user@facebook.com",
      "linkedAt": "2025-12-31T11:00:00.000Z"
    }
  ]
}
```

---

## Quick Start Guide

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable desired providers (Google, Facebook, etc.)
4. Configure OAuth credentials

### 2. Client-Side Implementation

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();

async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();

  // Send to backend
  await fetch('/api/auth/social-auth', {
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
}
```

### 3. Backend Handling

The backend automatically:
- Creates new user if first time signing in
- Updates last login for existing users
- Checks account status (active/blocked/suspended)
- Returns user data with Firebase token

---

## Supported OAuth Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| Google | ✅ Ready | [Setup Guide](docs/OAUTH_SETUP.md#google-oauth-setup) |
| Facebook | ✅ Ready | [Setup Guide](docs/OAUTH_SETUP.md#facebook-oauth-setup) |
| Twitter | ✅ Ready | [Setup Guide](docs/OAUTH_SETUP.md#twitter-oauth-setup) |
| GitHub | ✅ Ready | [Setup Guide](docs/OAUTH_SETUP.md#github-oauth-setup) |
| Microsoft | ✅ Ready | Enable in Firebase Console |
| Apple | ✅ Ready | Required for iOS apps |

---

## Authentication Flow

### First Time User (Social Auth)

1. User clicks "Sign in with Google" on client
2. Firebase handles OAuth popup/redirect
3. Client receives Firebase user object
4. Client sends user data to `/api/auth/social-auth`
5. Backend creates new user in Firestore
6. Backend returns user data
7. Client stores token and navigates to dashboard

### Returning User (Social Auth)

1. User signs in with provider
2. Client sends user data to `/api/auth/social-auth`
3. Backend updates `lastLogin`
4. Backend checks `accountStatus`
5. Backend returns updated user data

### Provider Linking Flow

1. User already signed in (has valid token)
2. User clicks "Link Facebook Account"
3. Client handles Facebook OAuth
4. Client sends link request to `/api/auth/link-provider`
5. Backend adds Facebook to `linkedProviders` array
6. User can now sign in with either provider

---

## Security Features

### 1. Account Status Enforcement

```javascript
if (userData.accountStatus !== 'active') {
  return res.status(403).json({
    success: false,
    message: `Account is ${userData.accountStatus}. Please contact support.`
  });
}
```

### 2. Provider Duplicate Check

```javascript
const providerExists = linkedProviders.find(p => p.provider === provider);
if (providerExists) {
  return res.status(400).json({
    success: false,
    message: `${provider} is already linked to this account`
  });
}
```

### 3. Last Auth Method Protection

```javascript
if (linkedProviders.length === 1 && userData.authProvider === provider) {
  return res.status(400).json({
    success: false,
    message: 'Cannot unlink the only authentication method'
  });
}
```

### 4. Token Revocation Check

```javascript
const decodedToken = await auth.verifyIdToken(token, true);
// checkRevoked = true ensures token hasn't been revoked
```

---

## Client-Side Examples

Complete code examples available for:

- ✅ **Vanilla JavaScript** - Plain JavaScript implementation
- ✅ **React** - With context and hooks
- ✅ **Vue.js** - With composables
- ✅ **Angular** - With services
- ✅ **React Native** - Mobile implementation

See [CLIENT_OAUTH_EXAMPLES.md](docs/CLIENT_OAUTH_EXAMPLES.md) for complete code.

---

## Error Handling

### Common OAuth Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `auth/account-exists-with-different-credential` | Email used with different provider | Use provider linking |
| `auth/popup-closed-by-user` | User closed OAuth popup | Let user retry |
| `auth/popup-blocked` | Browser blocked popup | Show message to allow popups |
| `auth/unauthorized-domain` | Domain not authorized | Add to Firebase authorized domains |

### Backend Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Google sign-in works
- [ ] Facebook sign-in works
- [ ] First-time users are created in Firestore
- [ ] Returning users update lastLogin
- [ ] Blocked accounts cannot log in
- [ ] Suspended accounts cannot log in
- [ ] Provider linking works
- [ ] Cannot link same provider twice
- [ ] Cannot unlink last provider
- [ ] Token refresh updates user data
- [ ] Token revocation logs out all devices

### Test Accounts

Create test accounts for each provider to verify functionality.

---

## Best Practices

1. **Always use HTTPS** in production
2. **Validate tokens on backend** for every protected route
3. **Implement token refresh** to maintain sessions
4. **Check account status** before allowing access
5. **Use provider linking** instead of creating duplicate accounts
6. **Store tokens securely** (httpOnly cookies for web)
7. **Revoke tokens** on security events (password change, suspicious activity)

---

## Troubleshooting

### Issue: "OAuth redirect URI invalid"

**Solution:** Add your domain to Firebase authorized domains:
1. Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"

### Issue: "Email already exists"

**Solution:** User registered with different provider. Use provider linking instead of creating new account.

### Issue: "Token expired"

**Solution:** Implement token refresh mechanism (tokens expire after 60 minutes).

### Issue: "User not found in database"

**Solution:** Check that social-auth endpoint creates Firestore document correctly.

---

## Next Steps

1. ✅ OAuth functionality implemented
2. 📱 Implement client-side authentication UI
3. 🔗 Add provider linking UI in user settings
4. 🧪 Test all authentication flows
5. 🔒 Review and test security measures
6. 🚀 Deploy to production

For detailed setup instructions, see:
- [OAuth Setup Guide](docs/OAUTH_SETUP.md)
- [Client Examples](docs/CLIENT_OAUTH_EXAMPLES.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
