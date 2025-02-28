const User = require('../models/user');

exports.getCurrentUser = async (req, res) => {
  try {
    // User is added to req by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controllers/users.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    const user = new User({
      name,
      email,
      role: role || 'user',
      password: tempPassword
    });

    await user.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};