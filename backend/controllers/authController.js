const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ errors: [{ msg: 'User already exists' }] });
    }

    const user = new User({ username, email: email.toLowerCase(), password, role });
    await user.save();
    res.status(201).json({ message: 'User registered', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ errors: [{ msg: error.message || 'Server error during registration' }] });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errors: [{ msg: error.message || 'Server error during login' }] });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ errors: [{ msg: error.message || 'Server error fetching profile' }] });
  }
};

module.exports = { register, login, getProfile };