const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Setup Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'worklink-profile-pics', // ✅ Cloudinary folder for images
    allowed_formats: ['jpg', 'jpeg', 'png'], // ✅ Enforce only JPG, JPEG, PNG
    resource_type: 'image', // ✅ Ensure only images are uploaded
  },
});

// ✅ Strict Multer Middleware for Uploads
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // ✅ Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("❌ Only JPG, JPEG, and PNG image files are allowed!"), false);
    }
    cb(null, true);
  }
});

// ✅ Export Cloudinary & Upload Middleware
module.exports = { cloudinary, upload };
