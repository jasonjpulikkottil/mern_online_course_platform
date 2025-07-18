const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { validateRegistration, validateLogin } = require('../middlewares/validators');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
