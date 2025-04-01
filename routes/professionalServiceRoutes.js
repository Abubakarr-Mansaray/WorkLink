const express = require("express");
const ProfessionalService = require("../models/ProfessionalService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ **Add a new professional service (Protected Route)**
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { serviceName, category, description, experienceYears, contactInfo, pricingModel, availability } = req.body;
    const user = req.user.id; // Ensure the logged-in user is assigned as owner

    // ✅ **Ensure all required fields are provided**
    if (!serviceName || !category || !description || !experienceYears || !contactInfo || !pricingModel) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // ✅ **Validate contact information**
    if (!contactInfo.phone.match(/^\+?\d{10,15}$/)) {
      return res.status(400).json({ error: "Invalid phone number format." });
    }
    if (!contactInfo.email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // ✅ **Create new professional service**
    const newService = new ProfessionalService({
      user,
      serviceName,
      category,
      description,
      experienceYears,
      contactInfo,
      pricingModel,
      availability
    });

    await newService.save();
    res.status(201).json({ message: "Professional service added successfully", service: newService });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Get all professional services**
router.get("/", async (req, res) => {
  try {
    const services = await ProfessionalService.find().populate("user", "name email profilePicture");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Get a specific service by ID**
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ProfessionalService.findById(id).populate("user", "name email profilePicture");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Get services by category**
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const services = await ProfessionalService.find({ category }).populate("user", "name email profilePicture");

    if (!services.length) {
      return res.status(404).json({ message: "No services found in this category." });
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Update a professional service (Protected Route)**
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const service = await ProfessionalService.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Ensure only the owner can update their service
    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to update this service." });
    }

    // ✅ **Validate updated contact information if provided**
    if (updates.contactInfo) {
      if (updates.contactInfo.phone && !updates.contactInfo.phone.match(/^\+?\d{10,15}$/)) {
        return res.status(400).json({ error: "Invalid phone number format." });
      }
      if (updates.contactInfo.email && !updates.contactInfo.email.match(/^\S+@\S+\.\S+$/)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
    }

    const updatedService = await ProfessionalService.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "Service updated successfully", service: updatedService });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ **Delete a professional service (Protected Route)**
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const service = await ProfessionalService.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Ensure only the owner can delete their service
    if (service.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this service." });
    }

    await ProfessionalService.findByIdAndDelete(id);
    res.status(200).json({ message: "Service deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
