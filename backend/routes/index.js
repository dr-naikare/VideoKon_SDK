const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const schedulerRoutes = require('./schedularroute');
const authMiddleware = require('../middleware/authMiddleware');

// Auth routes
router.use('/auth', authRoutes);

// Scheduler routes
router.use('/scheduler',authMiddleware, schedulerRoutes);

module.exports = router;