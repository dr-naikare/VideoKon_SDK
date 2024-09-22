const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server} = require('socket.io');
const authRoutes = require('./routes/auth.js');
const authMiddleware = require('./middleware/authMiddleware');
const statusmonitor = require('express-status-monitor');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use(statusmonitor());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow cookies to be sent with requests
}));



app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
    console.log(`Connection request recieved by server from client ${socket.id}`);

    socket.on('join-room', (roomId, userId) => {

        console.log(`join-room request recieved by server from client ${userId}`); 
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId} successfully`);
        socket.to(roomId).emit('user-connected', userId);

        // Add listener for disconnection event
         socket.on('User-disconnect', (reason) => {
        console.log(`User ${userId} disconnected from room ${roomId} - Reason: ${reason}`);
        socket.leave(roomId);
        socket.to(roomId).emit('user-disconnected', userId);
  
        // Check if the room is empty and clean it up if needed
        const roomUsers = io.sockets.adapter.rooms.get(roomId);
        if (roomUsers && roomUsers.size === 0) {
          console.log(`Room ${roomId} is empty. Cleaning up.`);
          // Perform cleanup operations (e.g., remove data, release resources)
        }
        })
       
    });

    socket.on('offer', (data) => {
        console.log(`offer by client ${data.offerby} recieved by server`);
        socket.to(data.roomId).emit('offer', data);
       
    });

    socket.on('answer', (data) => {
        console.log(`answer  by client ${data.answerby} recieved by server`);
        socket.to(data.roomId).emit('answer', data);
       
    });

    socket.on('ice-candidate', (data) => {
        console.log(`ice-candidate  by client ${data.candidateby} recieved by server`);
        socket.to(data.roomId).emit('ice-candidate', data);
        console.log('ice-candidate sent to client');
    });

   
});
    

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));