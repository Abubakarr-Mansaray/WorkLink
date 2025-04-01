const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{10,15}$/, "Invalid phone number"] 
  },
  password: { type: String, required: true, minlength: 6 },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true }, // ✅ Added gender
  educationLevel: { 
    type: String, 
    enum: ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate"], 
    required: true 
  }, // ✅ Fixed education level options
  profession: { type: String, required: true, trim: true },
  jobCategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "JobCategory", 
    required: true 
  },
  yearsOfExperience: { type: Number, required: true, min: 0 },
  yearOfBirth: { 
    type: Number, 
    required: true, 
    min: 1900, 
    max: new Date().getFullYear() - 18 // ✅ Ensure user is 18+
  },
  availability: { 
    type: String, 
    enum: ["Available", "Not Available", "Already Booked"], 
    default: "Available" 
  },
  biography: { type: String, default: "", maxlength: 500 },
  skills: { type: [String], default: [] },
  address: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // ✅ Store reviews for employees & employers
  rating: { type: Number, default: 0 }, // ✅ Average user rating
  reviewCount: { type: Number, default: 0 } // ✅ Total reviews count
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
