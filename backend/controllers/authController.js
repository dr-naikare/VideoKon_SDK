const { registerUser } = require('./RegistrationController');
const { loginUser } = require('./loginController');
const { fetchUser } = require('./fetchUser');
const {refreshToken} = require('./tokenController');

module.exports = { registerUser, loginUser, fetchUser, refreshToken };