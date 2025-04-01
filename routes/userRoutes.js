const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ✅ Public Route: Fetch Employees Based on Job Category
router.get("/employees", async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: "Job category is required." });
    }

    // Fetch employees based on job category
    const employees = await User.find({ profession: category })
      .select("name profession skills yearsOfExperience availability profilePicture address");

    // Check if employees exist in the given category
    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found in this category." });
    }

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
