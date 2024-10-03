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
  console.log(`Connection established: ${socket.id}`);

  // Handle joining a room
  socket.on("join-room", (roomId, userId) => {
    console.log(`User ${userId} joining room ${roomId}`);
    socket.join(roomId);

    // Initialize participants for the room if not exists
    if (!participants[roomId]) {
      participants[roomId] = [];
    }

    // Add user to the participants list
    participants[roomId].push({ id: userId });
    console.log(`User ${userId} joined room ${roomId} successfully`);

    // Emit the updated participants list to everyone in the room
    io.to(roomId).emit("participants-updated", participants[roomId]);

    // Notify others that a new user has connected
    socket.to(roomId).emit("user-connected", userId);

    // Add listener for disconnection event
    socket.on("User-disconnect", (reason) => {
      console.log(`User ${userId} disconnected from room ${roomId} - Reason: ${reason}`);
      socket.leave(roomId);

      // Remove user from the participants list
      participants[roomId] = participants[roomId].filter((user) => user.id !== userId);

      // Emit the updated participants list
      io.to(roomId).emit("participants-updated", participants[roomId]);

      // Notify others in the room that the user has disconnected
      socket.to(roomId).emit("user-disconnected", userId);

      // Clean up if the room is empty
      if (participants[roomId].length === 0) {
        delete participants[roomId];
        console.log(`Room ${roomId} is empty. Cleaning up.`);
      }
    });
  });

  // Handle offer from a user
  socket.on("offer", (data) => {
    console.log(`Offer from ${data.userId} to ${data.targetUserId} received.`);
    socket.to(data.targetUserId).emit("offer", {
      offer: data.offer,
      roomId: data.roomId,
      userId: data.userId,
    });
  });

  // Handle answer from a user
  socket.on("answer", (data) => {
    console.log(`Answer from ${data.userId} to ${data.targetUserId} received.`);
    socket.to(data.targetUserId).emit("answer", {
      answer: data.answer,
      roomId: data.roomId,
      userId: data.userId,
    });
  });

  // Handle ICE candidates
  socket.on("ice-candidate", (data) => {
    console.log(`ICE candidate from ${data.userId} to ${data.targetUserId} received.`);
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
