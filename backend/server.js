const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server} = require('socket.io');
const authRoutes = require('./routes/auth.js');
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
    console.log('a user connected and connection recieved by server',socket.id);

    socket.on('join-room', (roomId, userId) => {
        console.log('join-room recieved by server', userId); 
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
        socket.to(roomId).emit('user-connected', userId);
        console.log( 'user connected sent to client');

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    socket.on('offer', (data) => {
        console.log('offer recieved by server', data);
        socket.to(data.roomId).emit('offer', data);
        console.log('offer sent to client');
    });

    socket.on('answer', (data) => {
        console.log('answer recieved by server', data);
        socket.to(data.roomId).emit('answer', data);
        console.log('answer emitted to client');
    });

    socket.on('ice-candidate', (data) => {
        console.log('ice-candidate recieved by server', data);
        socket.to(data.roomId).emit('ice-candidate', data);
        console.log('ice-candidate sent to client');
    });
});
    

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));