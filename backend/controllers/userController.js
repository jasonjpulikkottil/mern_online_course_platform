const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    user = new User({
      username,
      email,
      password,
      role,
    });

    // The pre-save hook in the User model will hash the password

    await user.save();

    const newUser = await User.findById(user._id).select('-password');
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to create user' }] });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to fetch users' }] });
  }
};

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('-password');
    res.status(200).json(instructors);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to fetch instructors' }] });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to fetch user' }] });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }
      user.email = email.toLowerCase();
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
      }
      user.username = username;
    }

    user.role = role || user.role;

    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ errors: [{ msg: 'Username or email already exists' }] });
    }
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to update user' }] });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to delete user' }] });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
      }
      user.email = email.toLowerCase();
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
      }
      user.username = username;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ errors: [{ msg: 'Username or email already exists' }] });
    }
    res.status(500).json({ errors: [{ msg: err.message || 'Failed to update profile' }] });
  }
};
