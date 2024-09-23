const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth.js');
const roomRoutes = require('./routes/room.js');
const statusmonitor = require('express-status-monitor');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true, // Allow credentials (cookies) to be sent
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(statusmonitor());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);

// Socket.IO connection
const participantsMap = {}; // Store participants by roomId

io.on('connection', (socket) => {
    console.log(`Connection request received from client ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        // Add user to the participants list
        if (!participantsMap[roomId]) {
            participantsMap[roomId] = [];
        }
        participantsMap[roomId].push(userId);

        // Emit existing participants to the new user
        socket.emit('existing-participants', participantsMap[roomId]);

        // Notify other users in the room
        socket.to(roomId).emit('user-connected', userId);

        socket.on('User-disconnect', () => {
            console.log(`User ${userId} disconnected from room ${roomId}`);
            socket.leave(roomId);
            participantsMap[roomId] = participantsMap[roomId].filter(participant => participant !== userId);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    socket.on('offer', (data) => {
        console.log(`Offer by client ${data.offerby} received by server`);
        socket.to(data.roomId).emit('offer', data);
    });

    socket.on('answer', (data) => {
        console.log(`Answer by client ${data.answerby} received by server`);
        socket.to(data.roomId).emit('answer', data);
    });

    socket.on('ice-candidate', (data) => {
        console.log(`ICE candidate by client ${data.candidateby} received by server`);
        socket.to(data.roomId).emit('ice-candidate', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
