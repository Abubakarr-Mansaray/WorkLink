const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const { io, onlineUsers } = require("../server");

const router = express.Router();

// 📌 Get all notifications for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Mark notifications as read
router.put("/markAsRead", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    // ✅ Emit notification update to user
    const userSocketId = onlineUsers.get(req.user.id);
    if (userSocketId) {
      io.to(userSocketId).emit("notificationRead", { userId: req.user.id });
    }

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
