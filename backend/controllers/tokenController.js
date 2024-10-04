const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const dotenv = require('dotenv');

dotenv.config();

const refreshToken = async (req, res) => {
    const { token: refreshToken } = req.body;
    console.log('Refresh token:', refreshToken);

    if (!refreshToken) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log('Decoded:', decoded);
        const storedToken = await RefreshToken.findOne({ token: refreshToken, userId: decoded.id });

        if (!storedToken || storedToken.expiryDate < new Date()) {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: 'Refresh Token is not valid' });
    }
};

module.exports = { refreshToken };