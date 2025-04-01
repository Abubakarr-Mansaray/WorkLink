const express = require("express");
const Review = require("../models/Review");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Function to update user rating
const updateUserRating = async (userId) => {
  try {
    const reviews = await Review.find({ reviewedUser: userId });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await User.findByIdAndUpdate(
        userId,
        { rating: averageRating.toFixed(1), reviewCount: reviews.length },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(userId, { rating: 0, reviewCount: 0 }, { new: true });
    }
  } catch (error) {
    console.error("Error updating user rating:", error);
  }
};

// ✅ Submit a review (Protected Route)
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { jobId, reviewedUser, rating, comment } = req.body; // ✅ Added jobId
    const reviewer = req.user.id;

    // ✅ Ensure all fields are provided
    if (!jobId || !reviewedUser || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid review data. Ensure jobId, reviewedUser, and rating are provided." });
    }

    // ✅ Save the review
    const review = new Review({ jobId, reviewer, reviewedUser, rating, comment });
    await review.save();

    // ✅ Update the reviewed user's rating
    await updateUserRating(reviewedUser);

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Fetch reviews for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewedUser: userId }).populate("reviewer", "name email");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
