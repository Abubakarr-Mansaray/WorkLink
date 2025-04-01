const express = require("express");
const JobCategory = require("../models/JobCategory");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ Protect routes

const router = express.Router();

/**
 * ✅ Public Route: Get All Job Categories
 * - Anyone (Guest, Employer, Employee) can access job categories.
 */
router.get("/", async (req, res) => {
  try {
    const categories = await JobCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Protected Route: Add a New Job Category
 * - Only authenticated users (Admin or Employers) can add categories.
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await JobCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new JobCategory({ name, description });
    await category.save();

    res.status(201).json({ message: "Job category added successfully", category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Protected Route: Remove a Job Category
 * - Only admin/employer can delete categories.
 */
router.delete("/:categoryId", authMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await JobCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await JobCategory.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Job category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
