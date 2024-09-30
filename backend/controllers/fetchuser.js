const { request } = require('express');
const User = require('../models/User');

const dotenv = require('dotenv');
dotenv.config();

const fetchUser =  async (req, res) => {
    const userId = request.userId;
    console.log('userId:', userId);
    try {
        const user = await User.findById(req.headers.userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { fetchUser };