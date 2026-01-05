import { auth, db } from '../config/firebase.js';

export const userController = {
  // Get user profile
  getUserProfile: async (req, res) => {
    try {
      const userId = req.user.uid;

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: userDoc.id,
          ...userDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: error.message
      });
    }
  },

  // Update user profile
  updateUserProfile: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { name, phoneNumber, address, photoURL } = req.body;

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (address !== undefined) updateData.address = address;
      if (photoURL !== undefined) updateData.photoURL = photoURL;

      await db.collection('users').doc(userId).update(updateData);

      // Update Firebase Auth profile if name or photoURL changed
      const authUpdateData = {};
      if (name) authUpdateData.displayName = name;
      if (photoURL !== undefined) authUpdateData.photoURL = photoURL;

      if (Object.keys(authUpdateData).length > 0) {
        await auth.updateUser(userId, authUpdateData);
      }

      const updatedDoc = await db.collection('users').doc(userId).get();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
    try {
      const { limit = 50, accountStatus, role } = req.query;

      // Handle multiple roles (e.g., role=admin,super_admin)
      if (role && role.includes(',')) {
        const roles = role.split(',').map(r => r.trim());
        const usersSet = new Set();

        // Fetch users for each role
        for (const singleRole of roles) {
          let query = db.collection('users').where('role', '==', singleRole);

          if (accountStatus) {
            query = query.where('accountStatus', '==', accountStatus);
          }

          query = query.limit(parseInt(limit));
          const snapshot = await query.get();

          snapshot.forEach(doc => {
            usersSet.add(JSON.stringify({
              id: doc.id,
              ...doc.data()
            }));
          });
        }

        // Convert Set back to array of objects
        const users = Array.from(usersSet).map(user => JSON.parse(user));

        return res.status(200).json({
          success: true,
          count: users.length,
          data: users
        });
      }

      // Single role or no role filter
      let query = db.collection('users');

      if (accountStatus) {
        query = query.where('accountStatus', '==', accountStatus);
      }

      if (role) {
        query = query.where('role', '==', role);
      }

      query = query.limit(parseInt(limit));

      const snapshot = await query.get();
      const users = [];

      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  },

  // Set admin role (admin only)
  setAdminRole: async (req, res) => {
    try {
      const { uid } = req.params;

      // Set custom claims
      await auth.setCustomUserClaims(uid, { admin: true });

      // Update Firestore
      await db.collection('users').doc(uid).update({
        role: 'admin',
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Admin role set successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error setting admin role',
        error: error.message
      });
    }
  },

  // Update account status (admin only)
  updateAccountStatus: async (req, res) => {
    try {
      const { uid } = req.params;
      const { accountStatus } = req.body;

      const validStatuses = ['active', 'blocked', 'suspended'];
      if (!validStatuses.includes(accountStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid account status. Must be: active, blocked, or suspended'
        });
      }

      await db.collection('users').doc(uid).update({
        accountStatus,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Account status updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating account status',
        error: error.message
      });
    }
  },

  // Add to wishlist
  addToWishlist: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { productId } = req.body;

      // Check if product exists
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const wishlist = userData.wishlist || [];

      // Check if product already in wishlist
      if (wishlist.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      wishlist.push(productId);

      await db.collection('users').doc(userId).update({
        wishlist,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Product added to wishlist',
        data: { wishlist }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding to wishlist',
        error: error.message
      });
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { productId } = req.params;

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      let wishlist = userData.wishlist || [];

      wishlist = wishlist.filter(id => id !== productId);

      await db.collection('users').doc(userId).update({
        wishlist,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
        data: { wishlist }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing from wishlist',
        error: error.message
      });
    }
  },

  // Get wishlist with product details
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.uid;

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const wishlist = userData.wishlist || [];

      if (wishlist.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      // Get product details for all items in wishlist
      const products = [];
      for (const productId of wishlist) {
        const productDoc = await db.collection('products').doc(productId).get();
        if (productDoc.exists) {
          products.push({
            id: productDoc.id,
            ...productDoc.data()
          });
        }
      }

      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching wishlist',
        error: error.message
      });
    }
  },

  // Verify phone number
  verifyPhoneNumber: async (req, res) => {
    try {
      const userId = req.user.uid;

      await db.collection('users').doc(userId).update({
        isPhoneVerified: true,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying phone number',
        error: error.message
      });
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    try {
      const userId = req.user.uid;

      await db.collection('users').doc(userId).update({
        isEmailVerified: true,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error verifying email',
        error: error.message
      });
    }
  },

  // Delete user (super admin only)
  deleteUser: async (req, res) => {
    try {
      const { uid } = req.params;
      const requesterId = req.user.uid;

      // Prevent self-deletion
      if (uid === requesterId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      // Check if user exists
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const userData = userDoc.data();

      // Prevent deleting super_admin if requester is not super_admin
      if (userData.role === 'super_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can delete other super admins'
        });
      }

      // Delete from Firebase Auth
      await auth.deleteUser(uid);

      // Delete from Firestore
      await db.collection('users').doc(uid).delete();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
};

export default userController;
