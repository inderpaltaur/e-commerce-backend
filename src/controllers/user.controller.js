const { auth, db } = require('../config/firebase');

const userController = {
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
      const { displayName, phoneNumber, address } = req.body;

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (displayName) updateData.displayName = displayName;
      if (phoneNumber) updateData.phoneNumber = phoneNumber;
      if (address) updateData.address = address;

      await db.collection('users').doc(userId).update(updateData);

      // Update Firebase Auth profile if displayName changed
      if (displayName) {
        await auth.updateUser(userId, { displayName });
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
      const { limit = 50 } = req.query;

      const snapshot = await db
        .collection('users')
        .limit(parseInt(limit))
        .get();

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
  }
};

module.exports = userController;
