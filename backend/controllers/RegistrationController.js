const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const registerUser = async (req, res) => {
    const { email, password,name } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        console.error('Error saving new user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser };