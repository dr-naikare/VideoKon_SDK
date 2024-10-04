const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new room
router.post('/', authMiddleware, async (req, res) => {
    const roomId = uuidv4(); 
    try {
        const newRoom = new Room({ roomId, creatorId: req.userId });
        await newRoom.save();
        res.status(201).json({ message: 'Room created successfully', roomId });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/:roomId', authMiddleware, async (req, res) => {
    const roomId = req.params.roomId
    try {
        const room = await Room.findOne({ roomId: roomId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Joined room successfully', roomId });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;