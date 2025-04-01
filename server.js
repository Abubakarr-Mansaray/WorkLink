require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ WebSocket Configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*", // Allow frontend connections
    methods: ["GET", "POST"],
  },
});

// ✅ Middleware
app.use(express.json());
app.use(cors()); // ✅ Enable CORS

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const jobCategoryRoutes = require("./routes/jobCategoryRoutes"); // Ensure import
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ Import Review Routes
const professionalServiceRoutes = require("./routes/professionalServiceRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobcategories", jobCategoryRoutes); // ✅ Ensure correct route path
app.use("/api/reviews", reviewRoutes); // ✅ Use Review Routes
app.use("/api/professional-services", professionalServiceRoutes);

// ✅ MongoDB Connection with Error Handling
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed", err);
    process.exit(1); // Stop the server if MongoDB fails
  });

// ✅ WebSocket Server for Real-Time Notifications
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔗 New client connected:", socket.id);

  // Register user on connection
  socket.on("register", (userId) => {
    if (userId) {
      console.log(`🟢 User Registered: ${userId}`);
      onlineUsers.set(userId, socket.id);
    }
  });

  // Send notification to a user
  socket.on("sendNotification", ({ userId, message }) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// ✅ WebSocket Status Route
app.get("/ws", (req, res) => {
  res.send("WebSocket is running...");
});

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("Welcome to WorkLink API! 🚀");
});

// ✅ Export WebSockets BEFORE starting the server
module.exports = { io, onlineUsers };

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
