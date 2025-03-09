const express = require("express");
const bcrypt = require("bcryptjs"); // Ensure bcrypt is required
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure User model is required

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization"); // Get token from header

  if (!token) return res.status(401).json({ msg: "Access Denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Remove 'Bearer ' and verify
    req.user = verified; // Save user data to request
    next(); // Move to the next function
  } catch (err) {
    res.status(400).json({ msg: "Invalid Token" });
  }
};

// User Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // Ensure JWT_SECRET is in your .env file
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({ token, msg: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Route (Example)
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

module.exports = router;
