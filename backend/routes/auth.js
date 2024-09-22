const express = require('express');
const { registerUser, loginUser , fetchUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user',authMiddleware, fetchUser);

module.exports = router;