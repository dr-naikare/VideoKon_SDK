const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/user', authMiddleware, authController.fetchUser);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;