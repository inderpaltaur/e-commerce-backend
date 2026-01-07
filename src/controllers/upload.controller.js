import multer from 'multer';
import { storage as firebaseStorage } from '../config/firebase.js';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

/**
 * Upload single product image to Firebase Storage
 */
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const file = req.file;
    const bucket = firebaseStorage.bucket();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `products/${timestamp}-${file.originalname}`;

    // Create file reference
    const fileUpload = bucket.file(filename);

    // Create write stream
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: timestamp,
        },
      },
      public: true,
    });

    // Handle upload errors
    stream.on('error', (error) => {
      console.error('Firebase Storage upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading image to Firebase Storage',
        error: error.message
      });
    });

    // Handle upload success
    stream.on('finish', async () => {
      try {
        // Make file public
        await fileUpload.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          imageUrl: publicUrl,
          filename: filename
        });
      } catch (error) {
        console.error('Error making file public:', error);
        res.status(500).json({
          success: false,
          message: 'Error generating public URL',
          error: error.message
        });
      }
    });

    // Write buffer to stream
    stream.end(file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

/**
 * Upload multiple product images to Firebase Storage
 */
export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const bucket = firebaseStorage.bucket();
    const uploadPromises = [];

    for (const file of req.files) {
      const timestamp = Date.now();
      const filename = `products/${timestamp}-${Math.random().toString(36).substring(7)}-${file.originalname}`;

      const uploadPromise = new Promise((resolve, reject) => {
        const fileUpload = bucket.file(filename);

        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
            metadata: {
              firebaseStorageDownloadTokens: timestamp,
            },
          },
          public: true,
        });

        stream.on('error', (error) => {
          reject(error);
        });

        stream.on('finish', async () => {
          try {
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            resolve({
              imageUrl: publicUrl,
              filename: filename
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.end(file.buffer);
      });

      uploadPromises.push(uploadPromise);
    }

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

/**
 * Delete image from Firebase Storage
 */
export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const bucket = firebaseStorage.bucket();
    const file = bucket.file(filename);

    await file.delete();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

export default {
  uploadProductImage,
  uploadProductImages,
  deleteImage
};
