import { auth, db } from '../config/firebase.js';

export const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, name, phoneNumber, photoURL, authProvider = 'Email' } = req.body;

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phoneNumber || undefined,
        photoURL: photoURL || undefined
      });

      // Store additional user data in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        name,
        email: userRecord.email,
        phoneNumber: phoneNumber || null,
        photoURL: photoURL || null,
        role: 'customer',
        authProvider,
        isPhoneVerified: false,
        isEmailVerified: userRecord.emailVerified || false,
        accountStatus: 'active',
        lastLogin: new Date().toISOString(),
        address: null,
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          name
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  // Login / Update last login
  login: async (req, res) => {
    try {
      const { email } = req.body;

      // Get user by email
      const userRecord = await auth.getUserByEmail(email);

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found in database'
        });
      }

      const userData = userDoc.data();

      // Check account status
      if (userData.accountStatus !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${userData.accountStatus}. Please contact support.`
        });
      }

      // Update last login
      await db.collection('users').doc(userRecord.uid).update({
        lastLogin: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'User found. Use Firebase client SDK to complete login.',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userData.name,
          accountStatus: userData.accountStatus
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  // Google Sign In / Social Auth
  socialAuth: async (req, res) => {
    try {
      const { uid, email, name, photoURL, phoneNumber, authProvider } = req.body;

      // Check if user exists
      const userDoc = await db.collection('users').doc(uid).get();

      if (userDoc.exists) {
        // Update last login
        await db.collection('users').doc(uid).update({
          lastLogin: new Date().toISOString()
        });

        const userData = userDoc.data();

        if (userData.accountStatus !== 'active') {
          return res.status(403).json({
            success: false,
            message: `Account is ${userData.accountStatus}. Please contact support.`
          });
        }

        return res.status(200).json({
          success: true,
          message: 'User logged in successfully',
          data: userData
        });
      }

      // Create new user for social auth
      await db.collection('users').doc(uid).set({
        uid,
        name,
        email,
        phoneNumber: phoneNumber || null,
        photoURL: photoURL || null,
        role: 'customer',
        authProvider,
        isPhoneVerified: false,
        isEmailVerified: true,
        accountStatus: 'active',
        lastLogin: new Date().toISOString(),
        address: null,
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const newUserDoc = await db.collection('users').doc(uid).get();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUserDoc.data()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Social authentication failed',
        error: error.message
      });
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const decodedToken = await auth.verifyIdToken(token);

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: decodedToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message
      });
    }
  },

  // Generate custom token (for custom auth flows)
  generateCustomToken: async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Verify user exists
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();

      // Check account status
      if (userData.accountStatus !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${userData.accountStatus}`
        });
      }

      // Generate custom token
      const customToken = await auth.createCustomToken(uid);

      res.status(200).json({
        success: true,
        message: 'Custom token generated successfully',
        data: {
          customToken,
          uid
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom token',
        error: error.message
      });
    }
  },

  // Refresh token (validate and return user data)
  refreshToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Verify the token
      const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true

      // Get fresh user data
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();

      // Check account status
      if (userData.accountStatus !== 'active') {
        return res.status(403).json({
          success: false,
          message: `Account is ${userData.accountStatus}`
        });
      }

      // Update last login
      await db.collection('users').doc(decodedToken.uid).update({
        lastLogin: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: userData
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed',
        error: error.message
      });
    }
  },

  // Link OAuth provider to existing account
  linkProvider: async (req, res) => {
    try {
      const { uid, provider, providerUid, email } = req.body;

      if (!uid || !provider || !providerUid) {
        return res.status(400).json({
          success: false,
          message: 'User ID, provider, and provider UID are required'
        });
      }

      // Get user data
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();

      // Initialize linkedProviders if not exists
      const linkedProviders = userData.linkedProviders || [];

      // Check if provider already linked
      const providerExists = linkedProviders.find(p => p.provider === provider);

      if (providerExists) {
        return res.status(400).json({
          success: false,
          message: `${provider} is already linked to this account`
        });
      }

      // Add provider to linked providers
      linkedProviders.push({
        provider,
        providerUid,
        email: email || userData.email,
        linkedAt: new Date().toISOString()
      });

      // Update user document
      await db.collection('users').doc(uid).update({
        linkedProviders,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: `${provider} linked successfully`,
        data: {
          linkedProviders
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to link provider',
        error: error.message
      });
    }
  },

  // Unlink OAuth provider
  unlinkProvider: async (req, res) => {
    try {
      const { uid, provider } = req.body;

      if (!uid || !provider) {
        return res.status(400).json({
          success: false,
          message: 'User ID and provider are required'
        });
      }

      // Get user data
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();
      const linkedProviders = userData.linkedProviders || [];

      // Check if provider is linked
      const providerIndex = linkedProviders.findIndex(p => p.provider === provider);

      if (providerIndex === -1) {
        return res.status(400).json({
          success: false,
          message: `${provider} is not linked to this account`
        });
      }

      // Check if this is the only auth method
      if (linkedProviders.length === 1 && userData.authProvider === provider) {
        return res.status(400).json({
          success: false,
          message: 'Cannot unlink the only authentication method'
        });
      }

      // Remove provider
      linkedProviders.splice(providerIndex, 1);

      // Update user document
      await db.collection('users').doc(uid).update({
        linkedProviders,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: `${provider} unlinked successfully`,
        data: {
          linkedProviders
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to unlink provider',
        error: error.message
      });
    }
  },

  // Get linked providers for a user
  getLinkedProviders: async (req, res) => {
    try {
      const userId = req.user.uid;

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();
      const linkedProviders = userData.linkedProviders || [];

      res.status(200).json({
        success: true,
        data: {
          primaryProvider: userData.authProvider,
          linkedProviders
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get linked providers',
        error: error.message
      });
    }
  },

  // Revoke user tokens (logout from all devices)
  revokeTokens: async (req, res) => {
    try {
      const userId = req.user.uid;

      // Revoke all refresh tokens for the user
      await auth.revokeRefreshTokens(userId);

      // Get the timestamp
      const userRecord = await auth.getUser(userId);
      const timestamp = new Date(userRecord.tokensValidAfterTime).toISOString();

      res.status(200).json({
        success: true,
        message: 'All tokens revoked successfully',
        data: {
          tokensValidAfter: timestamp
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to revoke tokens',
        error: error.message
      });
    }
  }
};

export default authController;
