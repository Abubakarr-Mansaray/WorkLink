const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Job", 
    required: [true, "Job ID is required"] // ✅ More descriptive error message
  },
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "Reviewer ID is required"] 
  }, // The person leaving the review
  reviewedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "Reviewed User ID is required"] 
  }, // The person receiving the review
  rating: { 
    type: Number, 
    required: [true, "Rating is required"], 
    min: [1, "Rating must be at least 1"], 
    max: [5, "Rating cannot be more than 5"] 
  }, // 1 to 5 stars
  comment: { 
    type: String, 
    maxlength: [500, "Comment cannot exceed 500 characters"] 
  }, // Optional feedback
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Review", ReviewSchema);
