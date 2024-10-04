const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const schedulerRoutes = require('./schedularroute');
const authMiddleware = require('../middleware/authMiddleware');
const roomRoutes = require('./room');

router.use('/auth', authRoutes);
router.use('/scheduler',authMiddleware, schedulerRoutes);
router.use('/room', roomRoutes);

module.exports = router;