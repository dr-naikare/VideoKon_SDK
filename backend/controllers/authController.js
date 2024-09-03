const { registerUser } = require('./RegistrationController');
const { loginUser } = require('./loginController');
const { fetchUser } = require('./fetchuser');

module.exports = { registerUser, loginUser, fetchUser };