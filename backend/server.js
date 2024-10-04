const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const statusmonitor = require("express-status-monitor");
const routes = require('./routes');
const redisClient = require('./redis/redis.config');
const { processNotifications } = require('./redis/Processor');
const Room = require('./models/Room'); // Assuming you have a Room model

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(statusmonitor());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Store participants in each room
const participants = {};

// Routes
app.use('/api', routes);

// WebSocket connection
io.on("connection", (socket) => {
  console.log(`Connection request received by server from client ${socket.id} at ${new Date().getMilliseconds()}`);

  socket.on("join-room", (roomId, userId) => {
    console.log(` join-room request received by server from client ${userId} at ${new Date().getMilliseconds()}`);
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId} successfully at ${new Date().getMilliseconds()}`);
    socket.to(roomId).emit("user-connected", userId);

    // Add listener for disconnection event
    socket.on("User-disconnect", async (reason) => {
      console.log(
        `User ${userId} disconnected from room ${roomId} - Reason: ${reason}`
      );
      
      // Check if the room is empty and clean it up if needed
      const roomUsers = io.sockets.adapter.rooms.get(roomId);
      if (roomUsers && roomUsers.size === 1) {
        await Room.findByIdAndUpdate(roomId, { active: false }, (err, room) => {
          if (err) {
            console.error(`Error updating room ${roomId}:`, err);
          } else {
            console.log(`Room ${roomId} marked as inactive.`);
          }
        });
        console.log(`Room ${roomId} is empty. Cleaning up.`);
        // Perform cleanup operations (e.g., remove data, release resources)
      }
      socket.leave(roomId);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("offer", (data) => {
    console.log(`Offer by client ${data.userId} for ${data.targetUserId} received by server at ${new Date().getMilliseconds()}`);
    
    const offerToEmit = typeof data.offer === "string" ? JSON.parse(data.offer) : data.offer;
    
    socket.to(data.targetUserId).emit("offer", {
      offer: offerToEmit,
      roomId: data.roomId,
      userId: data.userId,
    });
    console.log(`Offer by client ${data.userId} for ${data.targetUserId} emitted by server at ${new Date().getMilliseconds()}`);
  });

  socket.on("answer", (data) => {
    console.log(`Answer by client ${data.userId} for ${data.targetUserId} received by server at ${new Date().getMilliseconds()}`);
    socket.to(data.targetUserId).emit("answer", {
      answer: data.answer,
      roomId: data.roomId,
      userId: data.userId,
    });
    console.log(`Answer by client ${data.userId} for ${data.targetUserId} emitted by server at ${new Date().getMilliseconds()}`);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.targetUserId).emit("ice-candidate", {
      candidate: data.candidate,
      roomId: data.roomId,
      userId: data.userId,
    });
  });
});

// Start the notification processor
processNotifications();

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
io.listen(5001);
