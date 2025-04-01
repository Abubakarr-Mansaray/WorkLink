const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { io, onlineUsers } = require("../server"); // Import WebSocket instance

const router = express.Router();

// 📌 Send a message (Protected Route)
router.post("/:applicationId/send", authMiddleware, async (req, res) => {
  try {
    const { content, receiver } = req.body;
    const { applicationId } = req.params;

    if (!content || !receiver) {
      return res.status(400).json({ message: "Message content and receiver are required" });
    }

    const message = new Message({
      applicationId,
      sender: req.user.id,
      receiver,
      content,
    });

    await message.save();

    // ✅ Create a notification for the receiver
    const notification = new Notification({
      user: receiver,
      message: `You have a new message from ${req.user.name}.`,
    });

    await notification.save();

    // **🔹 Emit real-time notification**
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        message: `You have a new message from ${req.user.name}.`,
        sender: req.user.id,
      });
    }

    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
