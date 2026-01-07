import { auth } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided',
        hint: 'Please include Authorization header with Bearer token'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        hint: 'Authorization header format should be: Bearer <token>'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    console.log('Token verified for user:', decodedToken.uid);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
      hint: 'Please log out and log back in to refresh your token'
    });
  }
};

export const checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        hint: 'Token verification did not set user information'
      });
    }

    const userRecord = await auth.getUser(req.user.uid);

    console.log('User custom claims:', userRecord.customClaims);

    // Allow both admin and super_admin roles
    if (!userRecord.customClaims?.admin && !userRecord.customClaims?.super_admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        hint: 'Your account does not have admin privileges. Please request admin access or contact support.',
        userRole: userRecord.customClaims || 'none'
      });
    }

    // Attach role info to request for use in controllers
    req.userRole = userRecord.customClaims?.super_admin ? 'super_admin' : 'admin';

    console.log('Admin check passed. Role:', req.userRole);
    next();
  } catch (error) {
    console.error('Admin check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin status',
      error: error.message
    });
  }
};

export const checkSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRecord = await auth.getUser(req.user.uid);

    // Only allow super_admin role
    if (!userRecord.customClaims?.super_admin) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }

    req.userRole = 'super_admin';

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying super admin status',
      error: error.message
    });
  }
};
