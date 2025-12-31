# Client-Side OAuth Implementation Examples

Complete code examples for implementing Firebase OAuth authentication on the client-side.

## Table of Contents

1. [Setup](#setup)
2. [Vanilla JavaScript](#vanilla-javascript)
3. [React](#react)
4. [Vue.js](#vuejs)
5. [Angular](#angular)
6. [React Native](#react-native)
7. [Provider Linking](#provider-linking)
8. [Error Handling](#error-handling)

---

## Setup

### Install Firebase SDK

```bash
npm install firebase
```

### Initialize Firebase

```javascript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
```

---

## Vanilla JavaScript

### Google Sign-In

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  // Optional: Add scopes
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    // Send to backend
    const response = await fetch('http://localhost:5000/api/auth/social-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Google',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('User authenticated:', data.data);
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(data.data));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Authentication error:', error);
    alert('Failed to sign in: ' + error.message);
  }
}
```

### Facebook Sign-In

```javascript
import { FacebookAuthProvider } from 'firebase/auth';

async function signInWithFacebook() {
  const provider = new FacebookAuthProvider();

  // Optional: Add permissions
  provider.addScope('public_profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    // Send to backend (same as Google)
    const response = await fetch('http://localhost:5000/api/auth/social-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Facebook',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      })
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(data.data));
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Authentication error:', error);
    alert('Failed to sign in: ' + error.message);
  }
}
```

### GitHub Sign-In

```javascript
import { GithubAuthProvider } from 'firebase/auth';

async function signInWithGithub() {
  const provider = new GithubAuthProvider();
  provider.addScope('read:user');
  provider.addScope('user:email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    const response = await fetch('http://localhost:5000/api/auth/social-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'GitHub',
        photoURL: user.photoURL
      })
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(data.data));
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Authentication error:', error);
  }
}
```

### Sign Out

```javascript
import { signOut } from 'firebase/auth';

async function logout() {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

---

## React

### Authentication Context

```javascript
// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
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
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', token);
        return data.data;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async function signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await fetch('/api/auth/social-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          authProvider: 'Facebook',
          photoURL: user.photoURL
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', token);
        return data.data;
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem('authToken');
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### Login Component

```javascript
// Login.jsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookSignIn() {
    try {
      setError('');
      setLoading(true);
      await signInWithFacebook();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign in with Facebook');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>Sign In</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="btn btn-google"
      >
        <img src="/google-icon.svg" alt="Google" />
        Sign in with Google
      </button>

      <button
        onClick={handleFacebookSignIn}
        disabled={loading}
        className="btn btn-facebook"
      >
        <img src="/facebook-icon.svg" alt="Facebook" />
        Sign in with Facebook
      </button>
    </div>
  );
}

export default Login;
```

### Protected Route

```javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
```

---

## Vue.js

### Composable

```javascript
// useAuth.js
import { ref, onMounted } from 'vue';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

export function useAuth() {
  const auth = getAuth();
  const user = ref(null);
  const loading = ref(true);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/auth/social-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          authProvider: 'Google',
          photoURL: firebaseUser.photoURL
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', token);
        return data.data;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async function signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      const response = await fetch('/api/auth/social-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          authProvider: 'Facebook',
          photoURL: firebaseUser.photoURL
        })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('authToken', token);
        return data.data;
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem('authToken');
    user.value = null;
  }

  onMounted(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);
      }
      user.value = firebaseUser;
      loading.value = false;
    });
  });

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };
}
```

### Login Component

```vue
<!-- Login.vue -->
<template>
  <div class="login-container">
    <h2>Sign In</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <button
      @click="handleGoogleSignIn"
      :disabled="loading"
      class="btn btn-google"
    >
      <img src="/google-icon.svg" alt="Google" />
      Sign in with Google
    </button>

    <button
      @click="handleFacebookSignIn"
      :disabled="loading"
      class="btn btn-facebook"
    >
      <img src="/facebook-icon.svg" alt="Facebook" />
      Sign in with Facebook
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { signInWithGoogle, signInWithFacebook } = useAuth();
const error = ref('');
const loading = ref(false);

async function handleGoogleSignIn() {
  try {
    error.value = '';
    loading.value = true;
    await signInWithGoogle();
    router.push('/dashboard');
  } catch (err) {
    error.value = 'Failed to sign in with Google';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleFacebookSignIn() {
  try {
    error.value = '';
    loading.value = true;
    await signInWithFacebook();
    router.push('/dashboard');
  } catch (err) {
    error.value = 'Failed to sign in with Facebook';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>
```

---

## Angular

### Auth Service

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { getAuth, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
      }
      this.currentUserSubject.next(user);
    });
  }

  async signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await this.http.post<any>('/api/auth/social-auth', {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Google',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      }).toPromise();

      if (response.success) {
        localStorage.setItem('authToken', token);
        return response.data;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signInWithFacebook(): Promise<any> {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const response = await this.http.post<any>('/api/auth/social-auth', {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Facebook',
        photoURL: user.photoURL
      }).toPromise();

      if (response.success) {
        localStorage.setItem('authToken', token);
        return response.data;
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }
}
```

---

## React Native

### OAuth with Firebase

```javascript
// auth.js
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

export async function signInWithGoogle() {
  try {
    // Check if device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get user ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Send to backend
    const response = await fetch('http://your-api.com/api/auth/social-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Google',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signInWithFacebook() {
  try {
    // Login with Facebook
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw new Error('User cancelled the login process');
    }

    // Get access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error('Something went wrong obtaining access token');
    }

    // Create Firebase credential
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    // Sign in with credential
    const userCredential = await auth().signInWithCredential(facebookCredential);
    const user = userCredential.user;
    const token = await user.getIdToken();

    // Send to backend
    const response = await fetch('http://your-api.com/api/auth/social-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        authProvider: 'Facebook',
        photoURL: user.photoURL
      })
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await auth().signOut();
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

---

## Provider Linking

### Link Additional Provider

```javascript
async function linkGoogleAccount() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  try {
    const result = await linkWithPopup(currentUser, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    // Send to backend
    const token = await currentUser.getIdToken();
    const response = await fetch('/api/auth/link-provider', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: currentUser.uid,
        provider: 'Google',
        providerUid: result.user.providerData[0].uid,
        email: result.user.email
      })
    });

    const data = await response.json();
    console.log('Provider linked:', data);
  } catch (error) {
    if (error.code === 'auth/credential-already-in-use') {
      alert('This Google account is already linked to another user');
    }
    console.error('Error linking provider:', error);
  }
}
```

### Unlink Provider

```javascript
async function unlinkGoogleAccount() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const token = await currentUser.getIdToken();

  try {
    const response = await fetch('/api/auth/unlink-provider', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: currentUser.uid,
        provider: 'Google'
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Provider unlinked:', data);
      // Also unlink from Firebase
      await unlink(currentUser, 'google.com');
    }
  } catch (error) {
    console.error('Error unlinking provider:', error);
  }
}
```

---

## Error Handling

### Common OAuth Errors

```javascript
async function handleOAuthSignIn(provider) {
  try {
    const result = await signInWithPopup(auth, provider);
    // Success logic...
  } catch (error) {
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        alert('An account already exists with the same email but different sign-in credentials.');
        break;

      case 'auth/popup-closed-by-user':
        console.log('User closed the popup');
        break;

      case 'auth/cancelled-popup-request':
        console.log('Popup request cancelled');
        break;

      case 'auth/popup-blocked':
        alert('Popup was blocked by the browser');
        break;

      case 'auth/operation-not-allowed':
        alert('This sign-in method is not enabled');
        break;

      case 'auth/unauthorized-domain':
        alert('This domain is not authorized for OAuth operations');
        break;

      default:
        console.error('OAuth error:', error);
        alert('An error occurred during sign-in');
    }
  }
}
```

---

## Token Refresh

### Automatic Token Refresh

```javascript
// Setup token refresh every 50 minutes
import { getAuth } from 'firebase/auth';

function setupTokenRefresh() {
  const auth = getAuth();

  setInterval(async () => {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true); // force refresh
        localStorage.setItem('authToken', token);

        // Optionally refresh user data from backend
        await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Token refresh error:', error);
      }
    }
  }, 50 * 60 * 1000); // 50 minutes
}
```

---

## Best Practices

1. **Always validate tokens on the backend**
2. **Implement token refresh** to maintain sessions
3. **Handle errors gracefully** with user-friendly messages
4. **Use HTTPS** in production
5. **Store tokens securely** (use httpOnly cookies for web)
6. **Implement logout from all devices** using token revocation
7. **Check account status** before allowing access
8. **Use provider linking** instead of creating duplicate accounts

For backend setup instructions, see [OAUTH_SETUP.md](OAUTH_SETUP.md)
