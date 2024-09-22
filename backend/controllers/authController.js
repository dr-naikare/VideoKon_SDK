const { registerUser } = require('./RegistrationController');
const { loginUser } = require('./loginController');
const { fetchUser } = require('./fetchUser');

module.exports = { registerUser, loginUser, fetchUser };