const bcrypt = require('bcryptjs');
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
    const users = await User.find()
      .select('-password')
      .where('role').in(['admin', 'issuer', 'user']);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate allowed roles
    if (!['admin', 'issuer', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Admin can only be created by other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      department: role === 'user' ? department : undefined
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    if (updates.role === 'user' && !updates.department) {
      return res.status(400).json({ error: 'Department is required for users' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.body;
        
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ 
      id: user._id, 
      userId: user.userId,
      name: user.name,
      department: user.department 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// // Add to users.js controller
// exports.migratePasswords = async (req, res) => {
//   if (process.env.NODE_ENV !== 'development') {
//     return res.status(403).json({ error: 'Forbidden' });
//   }

//   try {
//     const users = await User.find();
    
//     for (const user of users) {
//       if (!user.password.startsWith('$2a$')) {
//         user.password = user.password; // Trigger pre-save hook
//         await user.save();
//       }
//     }
    
//     res.json({ message: 'Password migration complete' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

