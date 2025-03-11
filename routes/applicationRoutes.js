const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");
const router = express.Router();

// Apply for a job (Protected Route)
router.post("/:jobId/apply", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = new Application({
      job: req.params.jobId,
      applicant: req.user.id,
      message
    });

    await application.save();
    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all applications for a job (Only Employer Can View)
router.get("/:jobId/applications", authMiddleware, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const applications = await Application.find({ job: req.params.jobId }).populate("applicant", "name email");
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
