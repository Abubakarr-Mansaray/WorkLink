// Job Routes  
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Job = require("../models/Job");
const router = express.Router();

// Create a new job (Protected Route)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, location, salary } = req.body;
    const job = new Job({
      title, description, category, location, salary,
      postedBy: req.user.id, 
    });

    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single job by ID
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a job (Protected Route)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Job updated", job: updatedJob });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a job (Protected Route)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

