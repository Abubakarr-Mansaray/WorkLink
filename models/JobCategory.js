const mongoose = require("mongoose");

const JobCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // Job Category Name
  description: { type: String, default: "" }, // Optional description
});

module.exports = mongoose.model("JobCategory", JobCategorySchema);
