const express = require('express');
const { upload, cloudinary } = require('../models/cloudinary.js'); // ✅ Import Cloudinary
const User = require('../models/User'); // Import User model
const authMiddleware = require('../middleware/authMiddleware'); // Import authentication middleware

const router = express.Router();

// ✅ Upload & Replace Profile Picture
router.post('/upload-profile-pic', authMiddleware, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const imageUrl = req.file.path; // ✅ New Cloudinary URL

    // ✅ Step 1: Find the User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Step 2: Delete old image from Cloudinary (if exists)
    if (user.profilePic) {
      try {
        // Extract Cloudinary public_id from the previous URL
        const urlParts = user.profilePic.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0]; // ✅ Extract public_id without file extension

        if (publicId) {
          await cloudinary.uploader.destroy(publicId); // ✅ Delete old image
        }
      } catch (deleteError) {
        console.error("Error deleting old image:", deleteError.message);
      }
    }

    // ✅ Step 3: Update User's profile picture
    user.profilePic = imageUrl;
    await user.save();

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePic: user.profilePic, // ✅ Return new image URL
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading profile picture',
      error: error.message,
    });
  }
});

module.exports = router;
