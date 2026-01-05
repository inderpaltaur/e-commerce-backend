import { db, auth } from '../config/firebase.js';

// Initialize super admin (one-time setup with OAuth)
export const initializeSuperAdmin = async (req, res) => {
  try {
    const { uid, email, name, photoURL, authProvider } = req.body;

    // Check if a super admin already exists
    const superAdminSnapshot = await db.collection('users')
      .where('role', '==', 'super_admin')
      .limit(1)
      .get();

    if (!superAdminSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Super admin already exists. This setup can only be run once.'
      });
    }

    // Verify the user exists in Firebase Auth (they should have signed in with Google)
    try {
      await auth.getUser(uid);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'User not found in Firebase Auth. Please sign in with Google first.'
      });
    }

    // Set super admin custom claims
    await auth.setCustomUserClaims(uid, {
      super_admin: true
    });

    // Create user document in Firestore
    const userData = {
      uid,
      name,
      email,
      phoneNumber: null,
      photoURL: photoURL || null,
      role: 'super_admin',
      authProvider: authProvider || 'Google',
      isPhoneVerified: false,
      isEmailVerified: true,
      accountStatus: 'active',
      lastLogin: new Date().toISOString(),
      address: null,
      wishlist: [],
      linkedProviders: [authProvider || 'google.com'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(userData);

    return res.status(201).json({
      success: true,
      message: 'Super admin account created successfully',
      data: {
        uid,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Error initializing super admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error initializing super admin',
      error: error.message
    });
  }
};

// Check if super admin exists (public endpoint for setup UI)
export const checkSuperAdminExists = async (req, res) => {
  try {
    const superAdminSnapshot = await db.collection('users')
      .where('role', '==', 'super_admin')
      .limit(1)
      .get();

    return res.status(200).json({
      success: true,
      data: {
        exists: !superAdminSnapshot.empty
      }
    });
  } catch (error) {
    console.error('Error checking super admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking super admin',
      error: error.message
    });
  }
};

// Diagnostic endpoint to check user data by email (for debugging)
export const checkUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    // Get user from Firebase Auth
    let authUser;
    try {
      authUser = await auth.getUserByEmail(email);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'User not found in Firebase Auth',
        error: error.message
      });
    }

    // Get user from Firestore
    const userDoc = await db.collection('users').doc(authUser.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found in Firestore database',
        authData: {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName
        }
      });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      data: {
        uid: authUser.uid,
        email: authUser.email,
        firestoreData: {
          role: userData.role,
          accountStatus: userData.accountStatus,
          name: userData.name,
          authProvider: userData.authProvider,
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin
        },
        customClaims: authUser.customClaims || {}
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking user',
      error: error.message
    });
  }
};
