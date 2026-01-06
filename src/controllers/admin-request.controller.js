import { db, auth } from '../config/firebase.js';

// Create admin access request (public - for new users)
export const createPublicAdminRequest = async (req, res) => {
  try {
    const { uid, email, name, photoURL, reason } = req.body;

    // Verify the user exists in Firebase Auth
    try {
      await auth.getUser(uid);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'User not found in Firebase Auth. Please sign in with Google first.'
      });
    }

    // Check if user already has admin or super_admin role
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        return res.status(200).json({
          success: true,
          alreadyHasAccess: true,
          role: userData.role,
          message: `You already have ${userData.role} access. Please proceed to sign in.`,
          redirectTo: '/signin'
        });
      }
    }

    // Check if user has a pending request
    const existingRequestSnapshot = await db.collection('adminRequests')
      .where('userId', '==', uid)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequestSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending admin request'
      });
    }

    // Create admin request
    const adminRequestRef = db.collection('adminRequests').doc();
    const adminRequest = {
      requestId: adminRequestRef.id,
      userId: uid,
      userName: name,
      userEmail: email,
      photoURL: photoURL || null,
      requestedRole: 'admin', // Default to admin role
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      notes: null
    };

    await adminRequestRef.set(adminRequest);

    return res.status(201).json({
      success: true,
      message: 'Admin access request submitted successfully',
      data: adminRequest
    });
  } catch (error) {
    console.error('Error creating admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating admin request',
      error: error.message
    });
  }
};

// Check admin request by user ID (public - for checking status)
export const checkAdminRequestByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.collection('adminRequests')
      .where('userId', '==', userId)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'No admin request found'
      });
    }

    const request = snapshot.docs[0].data();

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching admin request',
      error: error.message
    });
  }
};

// Create admin access request (authenticated - legacy)
export const createAdminRequest = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { requestedRole, reason } = req.body;

    // Check if user already has admin or super_admin role
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    if (userData.role === 'admin' || userData.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'You already have admin access'
      });
    }

    // Check if user has a pending request
    const existingRequestSnapshot = await db.collection('adminRequests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequestSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending admin request'
      });
    }

    // Create admin request
    const adminRequestRef = db.collection('adminRequests').doc();
    const adminRequest = {
      requestId: adminRequestRef.id,
      userId,
      userName: userData.name,
      userEmail: userData.email,
      requestedRole,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      notes: null
    };

    await adminRequestRef.set(adminRequest);

    return res.status(201).json({
      success: true,
      message: 'Admin access request submitted successfully',
      data: adminRequest
    });
  } catch (error) {
    console.error('Error creating admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating admin request',
      error: error.message
    });
  }
};

// Get all admin requests (super admin only)
export const getAdminRequests = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    // Fetch all requests ordered by requestedAt desc, then filter in memory
    // This avoids Firestore index requirements for admin data
    let query = db.collection('adminRequests').orderBy('requestedAt', 'desc').limit(parseInt(limit));

    const snapshot = await query.get();

    let requests = [];
    snapshot.forEach(doc => {
      requests.push(doc.data());
    });

    // Filter by status if provided
    if (status) {
      requests = requests.filter(request => request.status === status);
    }

    return res.status(200).json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching admin requests',
      error: error.message
    });
  }
};

// Get current user's admin request
export const getMyAdminRequest = async (req, res) => {
  try {
    const userId = req.user.uid;

    const snapshot = await db.collection('adminRequests')
      .where('userId', '==', userId)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'No admin request found'
      });
    }

    const request = snapshot.docs[0].data();

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching admin request',
      error: error.message
    });
  }
};

// Approve admin request
export const approveAdminRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.uid;

    // Get the admin request
    const requestDoc = await db.collection('adminRequests').doc(requestId).get();

    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    const requestData = requestDoc.data();

    if (requestData.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${requestData.status}`
      });
    }

    // Get reviewer info
    const reviewerDoc = await db.collection('users').doc(reviewerId).get();
    const reviewerData = reviewerDoc.data();

    // Default to 'admin' role, only grant super_admin if explicitly requested AND reviewer approves
    const assignedRole = requestData.requestedRole === 'super_admin' ? 'admin' : 'admin';

    // Update user role in Firestore
    await db.collection('users').doc(requestData.userId).update({
      role: assignedRole,
      updatedAt: new Date().toISOString()
    });

    // Set custom claims in Firebase Auth - always set to admin by default
    await auth.setCustomUserClaims(requestData.userId, {
      admin: true
    });

    // Update admin request status
    await db.collection('adminRequests').doc(requestId).update({
      status: 'approved',
      reviewedBy: reviewerId,
      reviewerName: reviewerData.name,
      reviewedAt: new Date().toISOString(),
      notes: notes || null
    });

    return res.status(200).json({
      success: true,
      message: `Admin request approved. User is now a ${requestData.requestedRole}`,
      data: {
        requestId,
        userId: requestData.userId,
        assignedRole: requestData.requestedRole
      }
    });
  } catch (error) {
    console.error('Error approving admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error approving admin request',
      error: error.message
    });
  }
};

// Reject admin request
export const rejectAdminRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const reviewerId = req.user.uid;

    // Get the admin request
    const requestDoc = await db.collection('adminRequests').doc(requestId).get();

    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    const requestData = requestDoc.data();

    if (requestData.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${requestData.status}`
      });
    }

    // Get reviewer info
    const reviewerDoc = await db.collection('users').doc(reviewerId).get();
    const reviewerData = reviewerDoc.data();

    // Update admin request status
    await db.collection('adminRequests').doc(requestId).update({
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewerName: reviewerData.name,
      reviewedAt: new Date().toISOString(),
      notes: notes || null
    });

    return res.status(200).json({
      success: true,
      message: 'Admin request rejected',
      data: {
        requestId
      }
    });
  } catch (error) {
    console.error('Error rejecting admin request:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rejecting admin request',
      error: error.message
    });
  }
};
