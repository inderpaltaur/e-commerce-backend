import { db } from '../config/firebase.js';

export const siteInfoController = {
  // Get site info (public endpoint)
  getSiteInfo: async (req, res) => {
    try {
      const siteInfoDoc = await db.collection('siteInfo').doc('main').get();

      if (!siteInfoDoc.exists) {
        // Return default site info if not found
        const defaultSiteInfo = {
          id: 'main',
          projectName: 'E-commerce Store',
          description: 'Welcome to our online store',
          tagline: 'Your one-stop shop for quality products',
          contact: {
            phone: '',
            email: ''
          },
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          region: '',
          socialLinks: [],
          businessHours: {},
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return res.status(200).json({
          success: true,
          data: defaultSiteInfo
        });
      }

      const siteInfo = siteInfoDoc.data();

      res.status(200).json({
        success: true,
        data: {
          id: siteInfoDoc.id,
          ...siteInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching site info',
        error: error.message
      });
    }
  },

  // Update site info (admin only)
  updateSiteInfo: async (req, res) => {
    try {
      const updateData = { ...req.body };
      const userId = req.user.uid;

      // Remove system fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      // Set update metadata
      updateData.updatedAt = new Date().toISOString();
      updateData.updatedBy = userId;

      // Check if document exists
      const siteInfoRef = db.collection('siteInfo').doc('main');
      const siteInfoDoc = await siteInfoRef.get();

      if (!siteInfoDoc.exists) {
        // Create new document with creation metadata
        updateData.createdAt = new Date().toISOString();
        updateData.createdBy = userId;

        await siteInfoRef.set(updateData);
      } else {
        // Update existing document
        await siteInfoRef.update(updateData);
      }

      // Fetch and return updated data
      const updatedDoc = await siteInfoRef.get();
      const updatedData = updatedDoc.data();

      res.status(200).json({
        success: true,
        message: 'Site info updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating site info',
        error: error.message
      });
    }
  },

  // Upload logo (admin only)
  uploadLogo: async (req, res) => {
    try {
      // This would typically use a file upload service like Cloudinary, AWS S3, etc.
      // For now, we'll assume the file is uploaded and we receive the URL

      const { logoUrl, alt, fileName } = req.body;
      const userId = req.user.uid;

      if (!logoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Logo URL is required'
        });
      }

      const siteInfoRef = db.collection('siteInfo').doc('main');

      await siteInfoRef.update({
        logo: {
          url: logoUrl,
          alt: alt || 'Company Logo',
          fileName: fileName || ''
        },
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      });

      const updatedDoc = await siteInfoRef.get();
      const updatedData = updatedDoc.data();

      res.status(200).json({
        success: true,
        message: 'Logo updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating logo',
        error: error.message
      });
    }
  },

  // Upload favicon (admin only)
  uploadFavicon: async (req, res) => {
    try {
      const { faviconUrl, fileName } = req.body;
      const userId = req.user.uid;

      if (!faviconUrl) {
        return res.status(400).json({
          success: false,
          message: 'Favicon URL is required'
        });
      }

      const siteInfoRef = db.collection('siteInfo').doc('main');

      await siteInfoRef.update({
        favicon: {
          url: faviconUrl,
          fileName: fileName || ''
        },
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      });

      const updatedDoc = await siteInfoRef.get();
      const updatedData = updatedDoc.data();

      res.status(200).json({
        success: true,
        message: 'Favicon updated successfully',
        data: {
          id: updatedDoc.id,
          ...updatedData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating favicon',
        error: error.message
      });
    }
  },

  // Initialize default site info (admin only)
  initializeSiteInfo: async (req, res) => {
    try {
      const userId = req.user.uid;

      const defaultSiteInfo = {
        projectName: 'My E-commerce Store',
        description: 'Welcome to our online store. Discover quality products at great prices.',
        tagline: 'Your one-stop shop for quality products',
        contact: {
          phone: '',
          email: ''
        },
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        region: '',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        socialLinks: [],
        businessHours: {
          monday: { open: '09:00', close: '18:00', isOpen: true },
          tuesday: { open: '09:00', close: '18:00', isOpen: true },
          wednesday: { open: '09:00', close: '18:00', isOpen: true },
          thursday: { open: '09:00', close: '18:00', isOpen: true },
          friday: { open: '09:00', close: '18:00', isOpen: true },
          saturday: { open: '10:00', close: '16:00', isOpen: true },
          sunday: { open: null, close: null, isOpen: false }
        },
        maintenance: {
          isEnabled: false,
          message: 'Site is under maintenance',
          estimatedTime: '2 hours'
        },
        seo: {
          metaTitle: 'My E-commerce Store',
          metaDescription: 'Shop quality products online',
          keywords: ['ecommerce', 'shopping', 'online store']
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        updatedBy: userId
      };

      const siteInfoRef = db.collection('siteInfo').doc('main');

      // Check if already exists
      const existingDoc = await siteInfoRef.get();
      if (existingDoc.exists) {
        return res.status(400).json({
          success: false,
          message: 'Site info already exists'
        });
      }

      await siteInfoRef.set(defaultSiteInfo);

      res.status(201).json({
        success: true,
        message: 'Site info initialized successfully',
        data: {
          id: 'main',
          ...defaultSiteInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error initializing site info',
        error: error.message
      });
    }
  }
};

export default siteInfoController;