import { auth } from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

export const checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRecord = await auth.getUser(req.user.uid);

    // Allow both admin and super_admin roles
    if (!userRecord.customClaims?.admin && !userRecord.customClaims?.super_admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Attach role info to request for use in controllers
    req.userRole = userRecord.customClaims?.super_admin ? 'super_admin' : 'admin';

    next();
  } catch (error) {
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
