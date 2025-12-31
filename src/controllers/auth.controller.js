const { auth, db } = require('../config/firebase');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, displayName } = req.body;

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName
      });

      // Store additional user data in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName
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

  // Login is typically handled on client-side with Firebase Auth SDK
  // This endpoint is for custom token generation if needed
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

      res.status(200).json({
        success: true,
        message: 'User found. Use Firebase client SDK to complete login.',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
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
  }
};

module.exports = authController;
