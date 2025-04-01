const mongoose = require("mongoose");

const ProfessionalServiceSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Links the service to the user

  serviceName: { 
    type: String, 
    required: true, 
    trim: true 
  }, // Name of the business/service

  category: { 
    type: String, 
    enum: ["Legal", "Engineering", "Medical", "Construction", "Event Planning", "Consulting"],
    required: true 
  }, // Type of service offered

  description: { 
    type: String, 
    required: true, 
    maxlength: 1000 
  }, // Description of the service

  experienceYears: { 
    type: Number, 
    required: true, 
    min: 0 
  }, // Years of experience

  contactInfo: {
    phone: { 
      type: String, 
      required: true, 
      match: [/^\+?\d{10,15}$/, "Invalid phone number format"] 
    }, // Validate phone number format

    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    }, // Validate email format

    address: { type: String, required: true }
  }, // Contact details

  availability: { 
    type: String, 
    enum: ["Available", "Not Available"],
    default: "Available" 
  }, // Service availability

  pricingModel: {
    type: String,
    enum: ["Hourly Rate", "Fixed Price", "Consultation Fee", "Custom Pricing"],
    required: true
  }, // How the service is charged

  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  }, // Review system for service providers

  createdAt: { type: Date, default: Date.now }
});

// ✅ **Function to update ratings dynamically**
ProfessionalServiceSchema.methods.updateRatings = async function (newRating) {
  this.ratings.totalReviews += 1;
  this.ratings.averageRating = 
    (this.ratings.averageRating * (this.ratings.totalReviews - 1) + newRating) / this.ratings.totalReviews;
  await this.save();
};

module.exports = mongoose.model("ProfessionalService", ProfessionalServiceSchema);
