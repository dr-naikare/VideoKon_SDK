const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const fetchUser = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {fetchUser};