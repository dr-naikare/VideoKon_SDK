const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const fetchUser = async (req, res) => {
    // Use req.userId instead of request.headers.userId
    const userId = req.userId; // This should be set in your authMiddleware


    try {
        const user = await User.findById(userId).select('-password'); // Exclude the password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { fetchUser };
