const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification"); // ✅ Import Notification Model

const router = express.Router();

// ✅ Apply for a job (Protected Route)
router.post("/:jobId/apply", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    // Ensure message is provided
    if (!message) {
      return res.status(400).json({ message: "Message is required to apply." });
    }

    // Find the job
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Create a new application
    const application = new Application({
      job: req.params.jobId,
      applicant: req.user.id,
      message,
      status: "Pending", // ✅ Default status
    });

    await application.save();

    // ✅ Notify the employer
    const notification = new Notification({
      user: job.postedBy, // The job owner gets notified
      message: `New job application from ${req.user.name}.`,
    });

    await notification.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all applications for a job (Only Employer Can View)
router.get("/:jobId/applications", authMiddleware, async (req, res) => {
  try {
    // Find job and populate postedBy field
    const job = await Job.findById(req.params.jobId).populate("postedBy", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if the logged-in user is the job owner
    if (job.postedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You are not the job poster" });
    }

    // Fetch all applications for this job
    const applications = await Application.find({ job: req.params.jobId }).populate("applicant", "name email");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update application status (Employer Only)
router.put("/:applicationId/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Accepted", "Rejected"];

    // Ensure valid status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update." });
    }

    // Find application
    const application = await Application.findById(req.params.applicationId).populate("job");
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Ensure only the employer can update status
    if (application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: You cannot update this application." });
    }

    // Update status
    application.status = status;
    await application.save();

    // ✅ Notify the applicant
    const notification = new Notification({
      user: application.applicant,
      message: `Your application status has been updated to: ${status}.`,
    });

    await notification.save();

    res.status(200).json({ message: "Application status updated", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
