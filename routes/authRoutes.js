const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JobCategory = require("../models/JobCategory"); // ✅ Import JobCategory Model

const router = express.Router();

// 📌 **User Registration Route**
router.post("/register", async (req, res) => {
  try {
    const { 
      name, email, phoneNumber, password, gender, educationLevel, 
      profession, yearsOfExperience, yearOfBirth, availability, biography, skills, address 
    } = req.body;

    // ✅ **Ensure all required fields are provided**
    if (!name || !email || !phoneNumber || !password || !gender || !educationLevel || 
        !profession || !yearsOfExperience || !yearOfBirth) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // ✅ **Normalize email to lowercase**
    const normalizedEmail = email.toLowerCase();

    // ✅ **Ensure user is at least 18 years old**
    const currentYear = new Date().getFullYear();
    if (currentYear - yearOfBirth < 18) {
      return res.status(400).json({ error: "User must be at least 18 years old." });
    }

    // ✅ **Check if the user already exists**
    let userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    // ✅ **Find Job Category Based on Profession**
    let jobCategory = await JobCategory.findOne({ name: profession });

    // ✅ **If job category does not exist, create it automatically**
    if (!jobCategory) {
      jobCategory = new JobCategory({ name: profession });
      await jobCategory.save();
    }

    // ✅ **Hash password**
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ **Create new user**
    const newUser = new User({
      name,
      email: normalizedEmail,
      phoneNumber,
      password: hashedPassword,
      gender,
      educationLevel,
      profession,
      jobCategory: jobCategory._id, // ✅ Assign the correct category
      yearsOfExperience,
      yearOfBirth,
      availability,
      biography,
      skills,
      address
    });

    // ✅ **Save user to database**
    await newUser.save();

    // ✅ **Generate JWT Token**
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ 
      message: "User registered successfully", 
      token, 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
        educationLevel: newUser.educationLevel,
        profession: newUser.profession,
        jobCategory: jobCategory.name,
        profilePic: newUser.profilePic || null,
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// 📌 **User Login Route**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ **Check if user exists**
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ **Validate password**
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ **Generate JWT token**
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        educationLevel: user.educationLevel,
        profession: user.profession,
        jobCategory: user.jobCategory,
        profilePic: user.profilePic || null,
      },
    });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
